import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        appName: "MyORI Label Checker",
        titleHomePage: "Dashboard",
        titleInventoryPage: "Products",
        titleProductionPage: "Production",
        titleHistoryPage: "Search",
        titleSettingPage: "Settings",
        titleLicensePage: "License",
      },
    },
  },
});
