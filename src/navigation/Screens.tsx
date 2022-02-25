import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { Articles, Components, Home, Profile, Register, Pro } from '../screens';
import { Sprayer, Fan, Door } from '../devices';
import { useScreenOptions, useTranslation } from '../hooks';

const Stack = createStackNavigator();

export default () => {
  const { t } = useTranslation();
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions.stack}>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ title: t('navigation.home') }}
      />

      <Stack.Screen
        name="Components"
        component={Components}
        options={screenOptions.components}
      />

      <Stack.Screen
        name="Articles"
        component={Articles}
        options={{ title: t('navigation.articles') }}
      />

      <Stack.Screen name="Pro" component={Pro} options={screenOptions.pro} />

      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Register"
        component={Register}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Sprayer"
        component={Sprayer}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Fan"
        component={Fan}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Door"
        component={Door}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
