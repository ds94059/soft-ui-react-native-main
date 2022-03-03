import React, { useCallback, useState, useEffect } from 'react';
import { PermissionsAndroid, Alert } from 'react-native';
import { BleManager, State, ScanMode, Device } from 'react-native-ble-plx';

import { useData, useTheme, useTranslation } from '../hooks/';
import { Block, Button, Image, Input, Product, Text } from '../components/';
import { IArticle, ICategory } from '../constants/types';

export const bleManager = new BleManager();
export let sprayer: Device;

//init bleManager
const requestBlePermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Cool BLE App Location Request",
                message:
                    "Cool BLE App needs access to your location " +
                    "so you can connect to ble devices.",
                buttonNeutral: "Ask Me Later",
                buttonNegative: "Cancel",
                buttonPositive: "OK"
            }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // init bleManager
            const subscription = bleManager.onStateChange((state) => {
                if (state === State.PoweredOn) {
                    // 已確認藍牙正常開啟
                    console.log('scanning...')
                    bleManager.startDeviceScan(null, { scanMode: ScanMode.LowLatency }, (error, device) => {
                        if (error) {
                            console.log(error);
                            return;
                        }

                        if (device?.name !== "ArduinoBLE") return;

                        console.log('founded');
                        sprayer = device;
                        bleManager.stopDeviceScan();
                        connectDevice(sprayer);
                        subscription.remove();
                    })
                }
            }, true)

        } else {
            console.log("Storage permission denied");
        }
    } catch (err) {
        console.warn(err);
    }
};



// connect to the sprayer
const connectDevice = async (sprayer: Device) => {
    try {
        console.log('connecting...')
        await sprayer.connect()
            .then(async (sprayer: Device) => {
                await sprayer.discoverAllServicesAndCharacteristics();
                //setisConnected(true);
                console.log("connected");
                Alert.alert("Device connected", sprayer.name + " is connected.");
            })
            .catch((error: any) => {
                // Handle errors
                console.log(error);
            });
    } catch (error: any) {
        console.log(error);
    }
}

const Home = () => {
    const data = useData();
    const { t } = useTranslation();
    const [tab, setTab] = useState<number>(0);
    const { following, trending } = useData();
    const [products, setProducts] = useState(following);
    const { assets, colors, fonts, gradients, sizes } = useTheme();
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [selected, setSelected] = useState<ICategory>();

    const handleProducts = useCallback(
        (tab: number) => {
            setTab(tab);
            setProducts(tab === 0 ? following : trending);
        },
        [following, trending, setTab, setProducts],
    );

    const initCategories = () => {
        while (categories.length > 0)
            categories.pop();
        categories.push({ id: 1, name: 'Popular', image: require('../assets/icons/office.png') });
        categories.push({ id: 2, name: 'Newest', image: require('../assets/icons/home.png') });
    }

    useEffect(() => {
        requestBlePermission();
    })

    // init articles
    useEffect(() => {
        //initCategories();
        setCategories(data?.categories);
        setSelected(data?.categories[0]);
    }, [data.articles, data.categories]);

    // update products on category change
    useEffect(() => {
        // const category = data?.categories?.find(
        //     (category) => category?.id === selected?.id,
        // );

        // const newProducts = products?.filter(
        //     (product) => product?.category?.id === category?.id,
        // );

        // setProducts(newProducts);
        if (selected?.id === 1)
            setProducts(following);
        else
            setProducts(trending);

    }, [data, selected, setProducts]);

    return (
        <Block>
            {/* search input */}
            {/* <Block color={colors.card} flex={0} padding={sizes.padding}>
                <Input search placeholder={t('common.search')} />
            </Block> */}

            {/* toggle products list */}

            {/* <Block
                row
                flex={0}
                align="center"
                justify="center"
                color={colors.card}
                paddingBottom={sizes.sm}>
                <Button onPress={() => handleProducts(0)}>
                    <Block row align="center">
                        <Block
                            flex={0}
                            radius={6}
                            align="center"
                            justify="center"
                            marginRight={sizes.s}
                            width={sizes.socialIconSize}
                            height={sizes.socialIconSize}
                            gradient={gradients?.[tab === 0 ? 'primary' : 'secondary']}>
                            <Image source={assets.extras} color={colors.white} radius={0} />
                        </Block>
                        <Text p font={fonts?.[tab === 0 ? 'medium' : 'normal']}>
                            {t('home.following')}
                        </Text>
                    </Block>
                </Button>
                <Block
                    gray
                    flex={0}
                    width={1}
                    marginHorizontal={sizes.sm}
                    height={sizes.socialIconSize}
                />
                <Button onPress={() => handleProducts(1)}>
                    <Block row align="center">
                        <Block
                            flex={0}
                            radius={6}
                            align="center"
                            justify="center"
                            marginRight={sizes.s}
                            width={sizes.socialIconSize}
                            height={sizes.socialIconSize}
                            gradient={gradients?.[tab === 1 ? 'primary' : 'secondary']}>
                            <Image
                                radius={0}
                                color={colors.white}
                                source={assets.documentation}
                            />
                        </Block>
                        <Text p font={fonts?.[tab === 1 ? 'medium' : 'normal']}>
                            {t('home.trending')}
                        </Text>
                    </Block>
                </Button>    
            </Block> */}

            {/* categories list */}
            <Block color={colors.card} row flex={0} paddingVertical={sizes.padding}>
                <Block
                    scroll
                    horizontal
                    renderToHardwareTextureAndroid
                    showsHorizontalScrollIndicator={false}
                    contentOffset={{ x: -sizes.padding, y: 0 }}>
                    {categories?.map((category) => {
                        const isSelected = category?.id === selected?.id;
                        return (
                            <Button
                                radius={sizes.m}
                                marginHorizontal={sizes.s}
                                key={`category-${category?.id}}`}
                                onPress={() => setSelected(category)}
                                gradient={gradients?.[isSelected ? 'primary' : 'light']}>
                                <Image source={category.image} color={colors.white} radius={0} />
                                {/* <Text
                                    p
                                    bold={isSelected}
                                    white={isSelected}
                                    black={!isSelected}
                                    transform="capitalize"
                                    marginHorizontal={sizes.m}>
                                    {category?.name}
                                </Text> */}
                            </Button>
                        );
                    })}
                </Block>
            </Block>

            {/* products list */}
            <Block
                scroll
                paddingHorizontal={sizes.padding}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: sizes.l }}>
                <Block row wrap="wrap" justify="space-between" marginTop={sizes.sm}>
                    {products?.map((product) => (
                        <Product {...product} key={`card-${product?.id}`} />
                    ))}
                </Block>
            </Block>
        </Block>
    );
};

export default Home;
