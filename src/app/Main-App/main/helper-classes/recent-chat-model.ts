export class RecentChatModel {
  constructor(
    public name: string,
    public uid: string,
    public date: string,
    public time: string,
    public message: string,
    public read: string,
    public type: string,
    public image?: string
  ) {}
}
