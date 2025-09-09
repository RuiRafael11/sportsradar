// mobile/src/components/PushInitializer.js
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

// garante que as notificações aparecem em foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function PushInitializer() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          console.log("🔔 Permissão de notificações negada");
          return;
        }

        const token = (
          await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig?.extra?.eas?.projectId,
          })
        ).data;
        console.log("🔔 Expo push token:", token);

        // backend aceita pushToken ou expoPushToken
        await api.patch("/auth/me", { pushToken: token });
      } catch (e) {
        console.warn("Falha a inicializar push:", e.message);
      }
    })();
  }, [user]);

  return null;
}
