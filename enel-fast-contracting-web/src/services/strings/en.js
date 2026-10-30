import _ from 'lodash';
import app from './en/app';
import shops from './en/shops';
import promotions from './en/promotions';
import cards from './en/cards';
import brands from './en/brands';
import categories from './en/categories';
import supracategories from './en/supracategories';
import news from './en/news';
import interests from './en/interests';
import audience from './en/audience';
import floors from './en/floors';
import feedback from './en/feedback';
import gallery from './en/gallery';
import mobileUsers from './en/mobileUsers';
import wifiUsers from './en/wifiUsers';
import staticPages from './en/static';
import screens from './en/screens';
import beacons from './en/beacons';
import media from './en/media';
import locations from './en/locations';
import notifications from './en/notifications';
import adaptiveMedia from './en/adaptiveMedia';
import automationFlows from './en/automationFlows';
import userscredits from './en/userscredits';
import conversions from './en/conversions';
import usersconv from './en/usersconv';
import welcomeScreens from './en/welcomeScreens';
import logs from './en/logs';

export default _.merge(
    app,
    shops,
    promotions,
    cards,
    brands,
    categories,
    beacons,
    supracategories,
    news,
    interests,
    audience,
    floors,
    feedback,
    gallery,
    mobileUsers,
    wifiUsers,
    staticPages,
    screens,
    media,
    locations,
    notifications,
    adaptiveMedia,
    automationFlows,
    userscredits,
    conversions,
    usersconv,
    welcomeScreens,
    logs,
);
