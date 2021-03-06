export interface IBaseLink {
  title: string;
  summary: string;
  target: string;
}

export interface IRemoteLink extends IBaseLink {
  id: string;
  created_at: number;
  score: number;
  group_count: number;
  total: number;
}

export interface ILink extends IRemoteLink {
  probability: number;
}

export const isILink = (link: IBaseLink): link is ILink => {
  return (link as ILink).probability !== undefined;
};
