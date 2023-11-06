export interface ProgressInfo {
  progress: number
  eta_relative: number
  state: {
    skipped: boolean
    interrupted: boolean
    job: 'scripts_txt2img' | 'scripts_img2img'
    job_count: number
    job_timestamp: string
    job_no: number
    sampling_step: number
    sampling_steps: number
  },
  current_image: string
  textinfo: string
}