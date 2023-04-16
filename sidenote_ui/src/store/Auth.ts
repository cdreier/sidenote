import {
  AuthorizationError,
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationResponse,
  AuthorizationServiceConfiguration,
  BaseTokenRequestHandler,
  BasicQueryStringUtils,
  DefaultCrypto,
  FetchRequestor,
  GRANT_TYPE_AUTHORIZATION_CODE,
  GRANT_TYPE_REFRESH_TOKEN,
  LocalStorageBackend,
  LocationLike,
  RedirectRequestHandler,
  TokenRequest,
  TokenResponse,
} from '@openid/appauth'
import { makeObservable, observable } from 'mobx'
import { AjaxError } from 'rxjs/ajax'

import { sidenoteHistory } from '.'
import Feedback from './Feedback'

interface User {
  aud: string[];
  auth_time: number;
  iat: number;
  iss: string;
  rat: number;
  sub: string;
}

class NoHashQueryStringUtils extends BasicQueryStringUtils {
  parse(input: LocationLike, useHash: boolean) {
    return super.parse(input, false /* never use hash */)
  }
}

const getAuthServerURL = (withTrailingSlash = false) => {
  if (SERVER_CONFIG.AuthConfig.AuthAuthority.endsWith('/') && !withTrailingSlash) {
    return SERVER_CONFIG.AuthConfig.AuthAuthority.slice(0, -1)
  }
  if (!SERVER_CONFIG.AuthConfig.AuthAuthority.endsWith('/') && withTrailingSlash) {
    return SERVER_CONFIG.AuthConfig.AuthAuthority + '/'
  }
  return SERVER_CONFIG.AuthConfig.AuthAuthority
}

class Auth {

  @observable
  ready: boolean = false

  @observable
  user: User

  @observable
  access_token: string = ''

  @observable
  refresh_token: string = ''

  feedback: Feedback

  notifier: AuthorizationNotifier
  tokenHandler: BaseTokenRequestHandler
  authorizationHandler: RedirectRequestHandler

  refreshCount = 0

  constructor(feedback: Feedback) {
    makeObservable(this)

    console.log(SERVER_CONFIG)
    console.log(import.meta.env)

    this.feedback = feedback

    if (SERVER_CONFIG.NoAuth === true || SERVER_CONFIG.NoAuth === 'true') {
      this.ready = true
    } else {

      // initialize all the appauth stuff
      this.notifier = new AuthorizationNotifier()
      this.tokenHandler = new BaseTokenRequestHandler(new FetchRequestor())

      this.authorizationHandler = new RedirectRequestHandler(
        new LocalStorageBackend(),
        new NoHashQueryStringUtils(),
        window.location,
        new DefaultCrypto(),
      )

      this.notifier.setAuthorizationListener((req, res, err) => this.authListener(req, res, err))
      this.authorizationHandler.setAuthorizationNotifier(this.notifier)

      // check for existing tokens
      this.refresh_token = localStorage.getItem('refresh_token') || ''
      const tmpAccessToken = localStorage.getItem('access_token')
      if (tmpAccessToken) {
        this.access_token = tmpAccessToken
        this.fetchUser()
      }
    }
  }

  errorOccured(err: AjaxError) {
    this.feedback.errorOccured(err)
  }

  refresh() {
    AuthorizationServiceConfiguration.fetchFromIssuer(getAuthServerURL(), new FetchRequestor())
      .then((oResponse) => this.tokenHandler.performTokenRequest(oResponse, new TokenRequest({
        client_id: SERVER_CONFIG.AuthConfig.AuthClientID,
        redirect_uri: SERVER_CONFIG.AuthConfig.AuthRedirectUri,
        grant_type: GRANT_TYPE_REFRESH_TOKEN,
        refresh_token: this.refresh_token,
      })))
      .then((oResponse) => this.onSuccesAccess(oResponse, false))
      .catch(oError => {
        console.log('ERROR in refresh: logout', oError)
        if (this.refreshCount > 3) {
          this.refreshCount = 0
          this.logout()
        }
        this.refreshCount++
      })
  }

  fetchUser() {
    fetch(`${getAuthServerURL()}/userinfo`, {
      headers: {
        authorization: `Bearer ${this.access_token}`,
      },
    })
      .then(res => res.json())
      .then(res => {
        this.user = res
        this.ready = true
      }).catch(e => {
        console.log('user info request err', e)
        if (this.refresh_token) {
          this.refresh()
        }
      })
  }

  authListener(request: AuthorizationRequest, response: AuthorizationResponse | null, error: AuthorizationError | null) {

    if (response) {

      let extras: any
      if (request && request.internal) {
        extras = {
          code_verifier: request.internal.code_verifier,
        }
      }

      AuthorizationServiceConfiguration.fetchFromIssuer(getAuthServerURL(), new FetchRequestor())
        .then((oResponse) => this.tokenHandler.performTokenRequest(oResponse, new TokenRequest({
          client_id: SERVER_CONFIG.AuthConfig.AuthClientID,
          redirect_uri: SERVER_CONFIG.AuthConfig.AuthRedirectUri,
          grant_type: GRANT_TYPE_AUTHORIZATION_CODE, // GRANT_TYPE_REFRESH_TOKEN
          code: response.code,
          extras,
        })))
        .then((oResponse) => this.onSuccesAccess(oResponse, true))
        .catch(oError => {
          console.log('ERROR', oError)
        })
    }
  }

  onSuccesAccess(res: TokenResponse, redirect: boolean) {
    localStorage.setItem('access_token', res.accessToken)
    localStorage.setItem('refresh_token', res.refreshToken || '')
    this.access_token = res.accessToken
    this.refresh_token = res.refreshToken || ''

    if (redirect) {
      this.ready = true
      sidenoteHistory.replace('/')
    }
  }

  startAuth() {
    AuthorizationServiceConfiguration.fetchFromIssuer(getAuthServerURL(), new FetchRequestor())
      .then((response) => {
        this.authorizationHandler.performAuthorizationRequest(response, new AuthorizationRequest({
          client_id: SERVER_CONFIG.AuthConfig.AuthClientID,
          redirect_uri: SERVER_CONFIG.AuthConfig.AuthRedirectUri,
          scope: 'openid offline offline_access',
          response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
          // extras: environment.extra
        }))
      })
      .catch(error => {
        console.log(error)
      })
  }

  async callback() {
    this.authorizationHandler.completeAuthorizationRequestIfPossible()
  }

  async logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    location.reload()
  }

  getBearerToken(): string {
    return this.access_token
  }

}


export default Auth