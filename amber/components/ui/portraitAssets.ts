export const HEAD_ASSETS = [
  require('../../assets/ai-portraits/timothy_itayi_neutral_expression_facing_camera_head_and_shoul_0f9d1137-478a-44d0-bd39-d600c34db2cc_3.png'),
  require('../../assets/ai-portraits/timothy_itayi_human_cyborg_hybrid_partial_facial_implants_exp_c337c6ba-b3cb-4046-9554-357c27634711_3.png'),
  require('../../assets/ai-portraits/timothy_itayi_synthetic_human_replicant_slightly_uncanny_feat_5902affe-5785-43a1-8928-41222ec93cbe_3.png'),
];

export const getHeadAsset = (index: number) =>
  HEAD_ASSETS[index % HEAD_ASSETS.length];

export const OVERLAY_ASSETS = [
  require('../../assets/textures/Texturelabs_Glass_127S.jpg'),
  require('../../assets/textures/Texturelabs_Grunge_342S.jpg'),
  require('../../assets/textures/leather_red_02_coll1_1k.png'),
];

export const getOverlayAsset = (index: number) =>
  OVERLAY_ASSETS[index % OVERLAY_ASSETS.length];
