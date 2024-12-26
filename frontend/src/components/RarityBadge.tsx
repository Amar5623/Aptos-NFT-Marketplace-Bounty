import React from 'react';
import { Tag } from 'antd';

const rarityColors: { [key: number]: string } = {
  1: "green",
  2: "blue",
  3: "purple",
  4: "orange",
};

const rarityLabels: { [key: number]: string } = {
  1: "Common",
  2: "Uncommon",
  3: "Rare",
  4: "Super Rare",
};

interface RarityBadgeProps {
  rarity: number;
}

const RarityBadge: React.FC<RarityBadgeProps> = ({ rarity }) => (
  <Tag color={rarityColors[rarity]} style={{ margin: '4px 0' }}>
    {rarityLabels[rarity]}
  </Tag>
);

export default RarityBadge;
