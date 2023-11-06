import { Img2ImgPayload, ActivedImg2ImgPayload } from '@ctypes/sdapi'

export const getImg2ImgPayload = (payload: Partial<Img2ImgPayload> & ActivedImg2ImgPayload): Img2ImgPayload => {
  const {
    prompt,
    init_images = [],
    negative_prompt = '',
    seed = -1,
    subseed = -1,
    sampler_name = 'Euler a',
    batch_size = 1,
    steps = 20,
    cfg_scale = 7,
    width = 512,
    height = 512,
    sampler_index = 'Euler',
  } = payload
  return {
    prompt: prompt,
    negative_prompt,
    styles: [], // 包含应用于图像生成的样式的文件路径或标识符的列表，样式可以影响生成图像的外观和风格。
    seed, // 随机种子，用于控制生成的图像结果的确定性。设置为-1表示使用随机种子。
    subseed, // 子种子 (Subseed)。该参数用于控制生成过程中的子随机性。不同的子种子值会导致略微不同的图像生成结果。默认值为 `-1`，表示使用随机子种子。
    subseed_strength: 0, // 子种子强度。该参数控制子种子的影响力。较高的值会增加子种子的影响，从而导致更大的图像变化。默认值为 `0`。
    seed_resize_from_h: -1, // 调整大小的种子高度。该参数指定生成过程中用于调整大小的种子图像的高度。默认值为 `-1`，表示不使用调整大小的种子图像。
    seed_resize_from_w: -1, // 调整大小的种子宽度。该参数指定生成过程中用于调整大小的种子图像的宽度。默认值为 `-1`，表示不使用调整大小的种子图像。
    sampler_name, // 采样器名称。该参数指定用于生成图像的采样器的名称或标识符。可以选择不同的采样器来获得不同的生成效果。默认值为 "string"。
    batch_size, // 批量大小。该参数控制每次生成图像的批量大小。默认值为 `1`，表示每次生成一个图像。
    n_iter: 1, // 迭代次数。该参数指定生成过程的迭代次数。默认值为 `1`，表示只进行一次迭代。
    steps, // 步数。该参数指定每个迭代步骤中生成器和判别器的更新次数。较大的值可能会增加图像生成的质量，但也会增加计算时间。默认值为 `50`。
    cfg_scale, // 图像生成的尺度配置。
    width,
    height,
    restore_faces: false, // 是否还原图像中的面部特征。
    tiling: false, // 是否使用平铺生成图像。
    do_not_save_samples: false, // 是否保存生成的图像样本。
    do_not_save_grid: false, // 是否保存生成的图像网格。
    eta: 0, // η 值。该参数用于控制生成过程中噪声分布的形状。较大的值会产生更平滑的图像，较小的值会产生更噪声化的图像。默认值为 `0`。
    denoising_strength: 0, // 噪声抑制强度。该参数控制生成图像的噪声水平，较高的值可以减少噪声，但可能会损失图像的细节。默认值为 `0`。
    s_min_uncond: 0, // 无条件最小步骤。该参数指定生成过程中的无条件最小步骤数。默认值为 `0`
    s_churn: 0, // 搅动步骤数。该参数指定生成过程中的搅动步骤数。默认值为 `0`。
    s_tmax: 0, // 最大温度步骤数。该参数指定生成过程中的最大温度步骤数。默认值为 `0`。
    s_tmin: 0, // 最小温度步骤数。该参数指定生成过程中的最小温度步骤数。默认值为 `0`。
    s_noise: 1, // 噪声步骤数。该参数指定生成过程中的噪声步骤数。默认值为 `1`。
    override_settings: {}, // 覆盖设置。该参数允许覆盖生成器和判别器的设置。可以提供一个对象，包含要覆盖的特定设置。默认为空对象 `{}`。
    override_settings_restore_afterwards: true, // 是否在之后恢复覆盖的设置。当设置为 `true` 时，在生成过程之后会恢复覆盖的设置。默认值为 `true`。
    refiner_checkpoint: '',
    refiner_switch_at: 0,
    disable_extra_networks: false,
    comments: {},
    sampler_index, // 采样器索引。该参数指定使用的采样器的索引或标识符。默认值为 "Euler"。
    script_name: '', // 脚本名称。该参数指定要运行的特定脚本的名称。
    script_args: [], // 脚本参数。该参数用于提供给脚本的额外参数。默认为空数组 `[]`。
    send_images: true, // 是否发送图像。当设置为 `true` 时，生成的图像将被发送到输出。默认值为 `true`。
    save_images: false, // 否保存图像。当设置为 `true` 时，生成的图像将被保存。默认值为 `false`。
    alwayson_scripts: {}, // 是一个用于指定始终运行的脚本的参数。它允许在生成过程中始终运行特定的脚本，以提供额外的控制或处理功能。

    // special params for img2img
    init_images, // 包含初始化图像的文件路径或标识符的列表，作为模型输入的起点（本地文件路径 or Base64）。
    resize_mode: 0, // 0, 指定图像的调整大小模式。0表示不调整大小，1表示等比例缩放，2表示强制调整为指定的尺寸。
    image_cfg_scale: 0, // 0, 指定图像的缩放比例。0表示原始尺寸，1表示将尺寸缩小一半，以此类推。
    mask: '', // 指定遮罩图像的文件路径或标识符，用于指定需要进行特殊处理的区域。
    mask_blur_x: 4, // 4, 控制遮罩模糊的程度。较高的值表示更模糊的遮罩边缘。
    mask_blur_y: 4, // 4
    mask_blur: 0, // 0
    inpainting_fill: 0, // 0, 指定图像修复过程中填充缺失区域的方法。0表示不进行填充，1表示根据周围的内容进行填充，2表示根据指定的遮罩进行填充。
    inpaint_full_res: true, // true, 指定是否在修复过程中使用完整分辨率的图像。
    inpaint_full_res_padding: 0, // 0, 如果使用完整分辨率的图像进行修复，指定在图像周围添加的填充大小。
    inpainting_mask_invert: 0, // 0, 控制修复过程中遮罩的反转。0表示不反转，1表示反转。
    initial_noise_multiplier: 0, // 0, 指定在生成图像之前向模型添加的噪声的强度。较高的值可能会增加生成图像的多样性。
    latent_mask: '',
    include_init_images: false, // false
  }
}