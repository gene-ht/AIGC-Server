export interface Img2ImgPayload {
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
  sampler_index: string
  script_name: string
  script_args: string[]
  send_images: boolean // true
  save_images: boolean // false
  alwayson_scripts: Record<string, string> // {}

  // special params for img2img
  init_images: string[]
  resize_mode: number // 0
  image_cfg_scale: number // 0
  // mask: string
  mask_blur_x: number // 4
  mask_blur_y: number // 4
  mask_blur: number // 0
  inpainting_fill: number // 0
  inpaint_full_res: boolean // true
  inpaint_full_res_padding: number // 0
  inpainting_mask_invert: number // 0
  initial_noise_multiplier: number // 0
  latent_mask: string
  include_init_images: boolean // false
}

export type ActivedImg2ImgPayload = Pick<Img2ImgPayload, 'prompt' | 'init_images'>

export type InputImg2ImgPayload = Partial<Img2ImgPayload> & ActivedImg2ImgPayload

export interface Img2ImgInfo {
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

export interface Img2ImgResponse<T = Img2ImgInfo> {
  images: string[]
  parameters: Img2ImgPayload
  info: T
}