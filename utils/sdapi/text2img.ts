import { Text2ImagePayload, ActivedText2ImagePayload } from '@ctypes/sdapi'

export const getText2ImagePayload = (payload: Partial<Text2ImagePayload> & ActivedText2ImagePayload): Text2ImagePayload => {
  const {
    prompt,
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
    enable_hr: false, // 是否启用高分辨率模式 (High Resolution mode)。当设置为 `true` 时，将使用高分辨率的生成模型。默认值为 `false`。
    firstphase_width: 0, // 第一阶段生成的图像宽度。默认值为 `0`，表示使用默认的图像宽度。
    firstphase_height: 0, // 第一阶段生成的图像高度。默认值为 `0`，表示使用默认的图像高度。
    hr_scale: 2, // 高分辨率模式下的放大倍数。当启用高分辨率模式时，生成的图像将以指定的倍数进行放大。默认值为 `2`。
    hr_upscaler: '', // 高分辨率模式下的上采样器。该参数指定用于图像上采样的算法或模型。它可以是一个字符串，表示特定的上采样器，或者是一个模型的标识符。默认值为 "string"。
    hr_second_pass_steps: 0, // 高分辨率模式下的第二阶段生成步数。默认值为 `0`，表示只进行一次生成过程。
    hr_resize_x: 0, // 高分辨率模式下的水平调整大小。该参数用于调整生成的图像的宽度。默认值为 `0`，表示不进行调整。
    hr_resize_y: 0, // 高分辨率模式下的垂直调整大小。该参数用于调整生成的图像的高度。默认值为 `0`，表示不进行调整。
    hr_checkpoint_name: '',
    hr_sampler_name: '',
    hr_prompt: '',
    hr_negative_prompt: '',
    sampler_index, // 采样器索引。该参数指定使用的采样器的索引或标识符。默认值为 "Euler"。
    script_name: '', // 脚本名称。该参数指定要运行的特定脚本的名称。
    script_args: [], // 脚本参数。该参数用于提供给脚本的额外参数。默认为空数组 `[]`。
    send_images: true, // 是否发送图像。当设置为 `true` 时，生成的图像将被发送到输出。默认值为 `true`。
    save_images: false, // 否保存图像。当设置为 `true` 时，生成的图像将被保存。默认值为 `false`。
    alwayson_scripts: {} // 是一个用于指定始终运行的脚本的参数。它允许在生成过程中始终运行特定的脚本，以提供额外的控制或处理功能。
  }
}