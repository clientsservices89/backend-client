// import fetch from "node-fetch";

export const sendPushNotification = async (expoPushToken, title, body) => {
  if (!expoPushToken) {
    console.log("❌ No Expo push token");
    return;
  }

  // Validate token format
  if (!expoPushToken.startsWith("ExponentPushToken")) {
    console.log("❌ Invalid Expo push token:", expoPushToken);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title,
    body,
    priority: "high",
  };

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();

    // 👇 THIS IS CRITICAL
    if (data?.data?.status !== "ok") {
      console.error("❌ Expo push failed:", data);
    } else {
      console.log("✅ Push sent:", expoPushToken);
    }
  } catch (error) {
    console.error("❌ Push notification error:", error);
  }
};
