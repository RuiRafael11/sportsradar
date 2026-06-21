// mobile/src/components/PushInitializer.js
import { useEffect } from "react";
import Constants from "expo-constants";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const getProjectId = () =>
  Constants.expoConfig?.extra?.eas?.projectId ||
  Constants.easConfig?.projectId ||
  null;

const isExpoGo = () =>
  Constants.appOwnership === "expo" ||
  Constants.executionEnvironment === "storeClient";

export default function PushInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const projectId = getProjectId();
        if (isExpoGo() || !projectId) {
          console.log("Push notifications skipped in Expo Go or without EAS projectId.");
          return;
        }

        const Notifications = require("expo-notifications");

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
        });

        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.log("Permissao de notificacoes negada");
          return;
        }

        const token = (
          await Notifications.getExpoPushTokenAsync({ projectId })
        ).data;

        // backend aceita pushToken ou expoPushToken
        await api.patch("/auth/me", { pushToken: token });
        console.log("Expo push token registered.");
      } catch (e) {
        console.warn("Falha a inicializar push:", e.message);
      }
    })();
  }, [user]);

  return null;
}
