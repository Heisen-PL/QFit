import React, { useEffect } from "react";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  LoginScreen,
  CameraPermissionScreen,
  EntryScreen,
  RegisterScreenEntry,
  RegisterScreenBody,
  RegisterScreenLifestyle,
  RegisterScreenAim,
  RegisterScreenSeniority,
  MainMenuScreen,
  BodyAnalysisScreen,
  MyTrainingsScreen,
  MyDietScreen,
  SettingsScreen,
  UpdateScreenEntry,
  UpdateScreenBody,
  UpdateScreenLifestyle,
  UpdateScreenAim,
} from "./screens";
import { withTheme } from "react-native-paper";
import { useAppDispatch, useAppSelector } from "./app/store";
import { selectAuthState } from "./features/auth";
import { loadUserInfo } from "./features/user";

const Stack = createNativeStackNavigator();

const MainScreen = ({ theme }) => {
  const navigationRef = useNavigationContainerRef();
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(selectAuthState);

  useEffect(() => {
    if (token) {
      dispatch(loadUserInfo());
      navigationRef.navigate("MainMenu" as never);
    }
  }, [token]);

  return (
    <NavigationContainer theme={theme} ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Entry"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animation: "none",
        }}
      >
        <Stack.Screen name="Entry" component={EntryScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterEntry" component={RegisterScreenEntry} />
        <Stack.Screen name="RegisterBody" component={RegisterScreenBody} />
        <Stack.Screen
          name="RegisterLifestyle"
          component={RegisterScreenLifestyle}
        />
        <Stack.Screen name="RegisterAim" component={RegisterScreenAim} />
        <Stack.Screen
          name="RegisterSeniority"
          component={RegisterScreenSeniority}
        />
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="BodyAnalysis" component={BodyAnalysisScreen} />
        <Stack.Screen name="MyTrainings" component={MyTrainingsScreen} />
        <Stack.Screen name="MyDiet" component={MyDietScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="UpdateEntry" component={UpdateScreenEntry} />
        <Stack.Screen name="UpdateBody" component={UpdateScreenBody} />
        <Stack.Screen
          name="UpdateLifestyle"
          component={UpdateScreenLifestyle}
        />
        <Stack.Screen name="UpdateAim" component={UpdateScreenAim} />
        <Stack.Screen
          name="CameraPermission"
          component={CameraPermissionScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const Main = withTheme(MainScreen);
