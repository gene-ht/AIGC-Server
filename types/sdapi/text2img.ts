export interface Text2ImagePayload {
  prompt: string
  negative_prompt: string
  styles: string[]
  seed: number // -1
  subseed: number // -1
  subseed_strength: number // 0
  seed_resize_from_h: number // -1
  seed_resize_from_w: number // -1
  sampler_name: string
  batch_size: number // 1
  n_iter: number // 1
  steps: number // 50
  cfg_scale: number // 7
  width: number // 512
  height: number // 512
  restore_faces: boolean // true
  tiling: boolean // true
  do_not_save_samples: boolean // false
  do_not_save_grid: boolean // false
  eta: number  // 0
  denoising_strength: number // 0
  s_min_uncond: number // 0
  s_churn: number  // 0
  s_tmax: number // 0
  s_tmin: number // 0
  s_noise: number  // 0
  override_settings: Record<string, string> // {}
  override_settings_restore_afterwards: boolean // true
  refiner_checkpoint: string
  refiner_switch_at: number // 0
  disable_extra_networks: boolean // false
  comments: Record<string, string> // {}
  enable_hr: boolean // false
  firstphase_width: number // 0
  firstphase_height: number // 0
  hr_scale: number // 2
  hr_upscaler: string
  hr_second_pass_steps: number // 0
  hr_resize_x: number // 0
  hr_resize_y: number // 0
  hr_checkpoint_name: string
  hr_sampler_name: string
  hr_prompt: string
  hr_negative_prompt: string
  sampler_index: string
  script_name: string
  script_args: string[]
  send_images: boolean // true
  save_images: boolean // false
  alwayson_scripts: Record<string, string> // {}
}

export type ActivedText2ImagePayload = Pick<Text2ImagePayload, 'prompt'>

export type InputText2ImagePayload = Partial<Text2ImagePayload> & ActivedText2ImagePayload

export interface Text2ImageInfo {
  prompt: string // prompt + lora
  all_prompts: string[] // (prompt + lora)[]
  negative_prompt: string
  all_negative_prompts: string[]
  seed: number
  all_seeds: number[]
  subseed: number
  all_subseeds: number[]
  subseed_strength: number
  width: number
  height: number
  sampler_name: string
  cfg_scale: number
  steps: number
  batch_size: number
  restore_faces: boolean // true
  face_restoration_model: string // CodeFormer
  sd_model_name: string // checkpoint
  sd_model_hash: string // checkpoint hash: eg: 31829c378d
  sd_vae_name: string | null
  sd_vae_hash: string | null
  seed_resize_from_w: number // -1
  seed_resize_from_h: number // -1
  denoising_strength: number
  extra_generation_params: {
    Eta: number // 0
    'Style Selector Enabled': boolean // true
    'Style Selector Randomize': boolean // false
    'Style Selector Style': string // base
    'Lora hashes': string // lora hash: eg: 3d_toon_xl: b1f2a13934fc
  },
  index_of_first_image: number
  infotexts: string[] // ["a girl with yellow dress<lora:3d_toon_xl:1.0>\nNegative prompt: extra hands\nSteps: 30, Sampler: DPM++ 2M Karras, CFG scale: 7.0, Seed: 1296632466, Face restoration: CodeFormer, Size: 1024x1024, Model hash: 31829c378d, Model: SD_3dAnimationDiffusion_v10, Denoising strength: 0.0, Clip skip: 2, Tiling: True, Style Selector Enabled: True, Style Selector Randomize: False, Style Selector Style: base, Lora hashes: \"3d_toon_xl: b1f2a13934fc\", Version: v1.6.0", ...]
  styles: string[]
  job_timestamp: string, // 20231103185146
  clip_skip: number // 2
  is_using_inpainting_conditioning: boolean // false
}

export interface Text2ImageResponse<T = Text2ImageInfo> {
  images: string[]
  parameters: Text2ImagePayload
  info: T
}