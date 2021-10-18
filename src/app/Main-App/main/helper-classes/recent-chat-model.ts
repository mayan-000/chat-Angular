export class RecentChatModel {
  name: string;
  uid: string;
  date: string;
  time: string;
  message: string;
  read: string;
  type:string;
  image: string;

  constructor(name: string, uid:string, date: string, time: string, message: string, read: string, type: string, image: string) {
    this.name = name;
    this.uid = uid;
    this.date = date;
    this.time = time;
    this.message = message;
    this.read = read;
    this.type = type;
    this.image = image;
  }
}