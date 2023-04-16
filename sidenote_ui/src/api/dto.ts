
type Content = {
  id: string
  title: string
  abstract: string
  md: string
  created_at: string
  updated_at: string
  labels: string[]
  links: string[]
  backlinks: string[]
}

type SmallContent = {
  id: string
  title: string
  labels: string[]
}

type Label = {
  name: string
}

export interface OpenLinkResponse {
  url: string;
}


export type {
  Content,
  Label,
  SmallContent,
}