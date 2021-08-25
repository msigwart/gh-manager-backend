export interface GitHubUserDto {
  login: string
}

export interface GitHubRepoDto {
  id: bigint
  name: string
  full_name: string
}

export interface GitHubIssueDto {
  id: bigint
  created_at: string
  updated_at: string
}

export interface GitHubPullRequestDto {
  id: bigint
  created_at: string
  updated_at: string
  number: number
  repo: {
    full_name: string
  }
}

export interface GitHubReviewDto {
  id: bigint
  submitted_at: string
}
