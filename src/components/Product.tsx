import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/core';

import Block from './Block';
import Image from './Image';
import Text from './Text';
import { IProduct } from '../constants/types';
import { useTheme, useTranslation } from '../hooks/';

const Product = ({ id, image, title, description, type, linkLabel }: IProduct) => {
  const { t } = useTranslation();
  const { assets, colors, sizes } = useTheme();
  const navigation = useNavigation();

  const isHorizontal = type !== 'vertical';
  const CARD_WIDTH = (sizes.width - sizes.padding * 2 - sizes.sm) / 2;

  return (
    <Block
      card
      flex={0}
      row={isHorizontal}
      marginBottom={sizes.sm}
      width={isHorizontal ? CARD_WIDTH * 2 + sizes.sm : CARD_WIDTH}>
      <TouchableOpacity key={id} onPress={() => navigation.navigate(description)}>
        <Image
          key={id}
          // resizeMode="cover"
          source={image}
          style={{
            height: CARD_WIDTH * 0.8,
            width: isHorizontal ? CARD_WIDTH * 0.8 : '100%',
            resizeMode: "contain"
          }}
        />
      </TouchableOpacity>
      <Block
        paddingTop={sizes.s}
        justify="space-between"
        paddingLeft={isHorizontal ? sizes.sm : 0}
        paddingBottom={isHorizontal ? sizes.s : 0}>
        <Text p marginBottom={sizes.s}>
          {title}
        </Text>
        <TouchableOpacity>
          <Block row flex={0} align="center">
            <Text
              p
              color={colors.link}
              semibold
              size={sizes.linkSize}
              marginRight={sizes.s}>
              {linkLabel || t('common.readArticle')}
            </Text>
            <Image source={assets.arrow} color={colors.link} />
          </Block>
        </TouchableOpacity>
      </Block>
    </Block>
  );
};

export default Product;
