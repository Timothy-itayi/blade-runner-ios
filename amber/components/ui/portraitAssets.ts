export const HEAD_ASSETS = [
  require('../../assets/heads/head1.png'),
  require('../../assets/heads/head2.png'),
  require('../../assets/heads/head3.png'),
  require('../../assets/heads/head4.png'),
];

export const getHeadAsset = (index: number) =>
  HEAD_ASSETS[index % HEAD_ASSETS.length];
