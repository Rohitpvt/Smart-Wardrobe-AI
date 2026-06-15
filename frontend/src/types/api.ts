export interface ApiErrorResponse {
  detail: string | Array<{ msg: string; loc: string[]; type: string }>;
}
