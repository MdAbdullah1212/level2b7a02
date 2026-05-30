export interface IUser {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: "contributor" | "maintainer";
  created_at?: Date;
  updated_at?: Date;
}

export interface IIssue {
  id?: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at?: Date;
  updated_at?: Date;
}