import { createBrowserHistory } from 'history'
import { create } from 'mobx-persist'
import { createContext } from 'react'

import Auth from './Auth'
import Cache from './Cache'
import Current from './Current'
import Feedback from './Feedback'
import LabelGraph from './LabelGraph'
import SearchHandler from './SearchModel'
import WorldMap from './WorldMap'

const hydrate = create()

const sidenoteHistory = createBrowserHistory()

const feedback = new Feedback()

const auth = new Auth(feedback)
const AuthStore = createContext(auth)

const current = new Current(auth, feedback)
hydrate('currentStore', current).then(() => console.log('currentStore has been hydrated'))
const CurrentStore = createContext(current)

const SearchStore = createContext(new SearchHandler(auth))
const cache = new Cache(auth)
const CacheStore = createContext(cache)
const LabelGraphStore = createContext(new LabelGraph(auth, cache))
const WorldMapStore = createContext(new WorldMap(auth, cache))
const FeedbackStore = createContext(feedback)

export {
  CurrentStore,
  SearchStore,
  sidenoteHistory,
  CacheStore,
  AuthStore,
  LabelGraphStore,
  WorldMapStore,
  auth,
  FeedbackStore,
}