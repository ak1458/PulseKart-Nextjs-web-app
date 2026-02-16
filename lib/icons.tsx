import * as React from 'react';
import type { IconProps as TablerIconProps, TablerIcon } from '@tabler/icons-react';
import {
    IconActivity as TablerActivity,
    IconAlertCircle as TablerAlertCircle,
    IconAlertTriangle as TablerAlertTriangle,
    IconArrowDown as TablerArrowDown,
    IconArrowDownRight as TablerArrowDownRight,
    IconArrowLeft as TablerArrowLeft,
    IconArrowRight as TablerArrowRight,
    IconArrowUp as TablerArrowUp,
    IconArrowUpRight as TablerArrowUpRight,
    IconAward as TablerAward,
    IconBabyBottle as TablerBabyBottle,
    IconChartBar as TablerBarChart2,
    IconBell as TablerBell,
    IconBook as TablerBook,
    IconRobot as TablerBot,
    IconBox as TablerBox,
    IconBriefcase as TablerBriefcase,
    IconBuilding as TablerBuilding,
    IconCalendar as TablerCalendar,
    IconCamera as TablerCamera,
    IconCheck as TablerCheck,
    IconCircleCheck as TablerCheckCircle,
    IconChevronDown as TablerChevronDown,
    IconChevronLeft as TablerChevronLeft,
    IconChevronRight as TablerChevronRight,
    IconChevronUp as TablerChevronUp,
    IconClock as TablerClock,
    IconCode as TablerCode,
    IconCommand as TablerCommand,
    IconCopy as TablerCopy,
    IconCreditCard as TablerCreditCard,
    IconDatabase as TablerDatabase,
    IconCurrencyDollar as TablerDollarSign,
    IconDownload as TablerDownload,
    IconEdit as TablerEdit,
    IconExternalLink as TablerExternalLink,
    IconEye as TablerEye,
    IconFileText as TablerFileText,
    IconFilter as TablerFilter,
    IconFlask as TablerFlaskConical,
    IconBrandGithub as TablerGithub,
    IconGlobe as TablerGlobe,
    IconHeart as TablerHeart,
    IconHistory as TablerHistory,
    IconHome as TablerHome,
    IconPhoto as TablerImage,
    IconPhotoOff as TablerImageOff,
    IconCurrencyRupee as TablerIndianRupee,
    IconInfoCircle as TablerInfo,
    IconLayersUnion as TablerLayers,
    IconLayout as TablerLayout,
    IconLayoutDashboard as TablerLayoutDashboard,
    IconLeaf as TablerLeaf,
    IconLifebuoy as TablerLifeBuoy,
    IconLoader2 as TablerLoader2,
    IconLock as TablerLock,
    IconLogout as TablerLogOut,
    IconMail as TablerMail,
    IconMap as TablerMap,
    IconMapPin as TablerMapPin,
    IconMenu2 as TablerMenu,
    IconMessageCircle as TablerMessageCircle,
    IconMessage2 as TablerMessageSquare,
    IconMinus as TablerMinus,
    IconMoon as TablerMoon,
    IconDotsVertical as TablerMoreVertical,
    IconNavigation as TablerNavigation,
    IconPackage as TablerPackage,
    IconPercentage as TablerPercent,
    IconPhone as TablerPhone,
    IconPill as TablerPill,
    IconPlayerPlay as TablerPlay,
    IconPlus as TablerPlus,
    IconQuote as TablerQuote,
    IconRefresh as TablerRefreshCw,
    IconDeviceFloppy as TablerSave,
    IconSearch as TablerSearch,
    IconSend as TablerSend,
    IconSettings as TablerSettings,
    IconShield as TablerShield,
    IconShieldCheck as TablerShieldCheck,
    IconShoppingBag as TablerShoppingBag,
    IconShoppingCart as TablerShoppingCart,
    IconDeviceMobile as TablerSmartphone,
    IconSparkles as TablerSparkles,
    IconStar as TablerStar,
    IconStethoscope as TablerStethoscope,
    IconBuildingStore as TablerStore,
    IconSun as TablerSun,
    IconTag as TablerTag,
    IconThermometer as TablerThermometer,
    IconTrash as TablerTrash2,
    IconTrendingDown as TablerTrendingDown,
    IconTrendingUp as TablerTrendingUp,
    IconTruck as TablerTruck,
    IconTypography as TablerType,
    IconUpload as TablerUpload,
    IconUser as TablerUser,
    IconUserCheck as TablerUserCheck,
    IconUsers as TablerUsers,
    IconWallet as TablerWallet,
    IconWand as TablerWand2,
    IconX as TablerX,
    IconCircleX as TablerXCircle,
    IconBolt as TablerZap,
    IconHeartbeat as IconHeartPulse,
    IconMoodSad,
    IconMoodNeutral,
    IconMoodSmile,
} from '@tabler/icons-react';

const DEFAULT_STROKE = 1.75;

type IconProps = TablerIconProps;
const withDefaults = (Icon: TablerIcon) => (props: IconProps) => {
    const { stroke, ...rest } = props;
    return React.createElement(Icon, { stroke: stroke ?? DEFAULT_STROKE, ...rest });
};

// Lucide-compatible exports (for easy migration)
export const Activity = withDefaults(TablerActivity);
export const AlertCircle = withDefaults(TablerAlertCircle);
export const AlertTriangle = withDefaults(TablerAlertTriangle);
export const ArrowDown = withDefaults(TablerArrowDown);
export const ArrowDownRight = withDefaults(TablerArrowDownRight);
export const ArrowLeft = withDefaults(TablerArrowLeft);
export const ArrowRight = withDefaults(TablerArrowRight);
export const ArrowUp = withDefaults(TablerArrowUp);
export const ArrowUpRight = withDefaults(TablerArrowUpRight);
export const Award = withDefaults(TablerAward);
export const BabyBottle = withDefaults(TablerBabyBottle);
export const BarChart2 = withDefaults(TablerBarChart2);
export const Bell = withDefaults(TablerBell);
export const Book = withDefaults(TablerBook);
export const Bot = withDefaults(TablerBot);
export const Box = withDefaults(TablerBox);
export const Briefcase = withDefaults(TablerBriefcase);
export const Building = withDefaults(TablerBuilding);
export const Calendar = withDefaults(TablerCalendar);
export const Camera = withDefaults(TablerCamera);
export const Check = withDefaults(TablerCheck);
export const CheckCircle = withDefaults(TablerCheckCircle);
export const ChevronDown = withDefaults(TablerChevronDown);
export const ChevronLeft = withDefaults(TablerChevronLeft);
export const ChevronRight = withDefaults(TablerChevronRight);
export const ChevronUp = withDefaults(TablerChevronUp);
export const Clock = withDefaults(TablerClock);
export const Code = withDefaults(TablerCode);
export const Command = withDefaults(TablerCommand);
export const Copy = withDefaults(TablerCopy);
export const CreditCard = withDefaults(TablerCreditCard);
export const Database = withDefaults(TablerDatabase);
export const DollarSign = withDefaults(TablerDollarSign);
export const Download = withDefaults(TablerDownload);
export const Edit = withDefaults(TablerEdit);
export const Edit2 = withDefaults(TablerEdit);
export const ExternalLink = withDefaults(TablerExternalLink);
export const Eye = withDefaults(TablerEye);
export const FileText = withDefaults(TablerFileText);
export const Filter = withDefaults(TablerFilter);
export const FlaskConical = withDefaults(TablerFlaskConical);
export const Github = withDefaults(TablerGithub);
export const Globe = withDefaults(TablerGlobe);
export const Heart = withDefaults(TablerHeart);
export const HeartPulse = withDefaults(IconHeartPulse);
export const Frown = withDefaults(IconMoodSad);
export const Meh = withDefaults(IconMoodNeutral);
export const Smile = withDefaults(IconMoodSmile);
export const History = withDefaults(TablerHistory);
export const Home = withDefaults(TablerHome);
export const Image = withDefaults(TablerImage);
export const ImageOff = withDefaults(TablerImageOff);
export const IndianRupee = withDefaults(TablerIndianRupee);
export const Info = withDefaults(TablerInfo);
export const Layers = withDefaults(TablerLayers);
export const Layout = withDefaults(TablerLayout);
export const LayoutDashboard = withDefaults(TablerLayoutDashboard);
export const Leaf = withDefaults(TablerLeaf);
export const LifeBuoy = withDefaults(TablerLifeBuoy);
export const Loader2 = withDefaults(TablerLoader2);
export const Lock = withDefaults(TablerLock);
export const LogOut = withDefaults(TablerLogOut);
export const Mail = withDefaults(TablerMail);
export const Map = withDefaults(TablerMap);
export const MapPin = withDefaults(TablerMapPin);
export const Menu = withDefaults(TablerMenu);
export const MessageCircle = withDefaults(TablerMessageCircle);
export const MessageSquare = withDefaults(TablerMessageSquare);
export const Minus = withDefaults(TablerMinus);
export const Moon = withDefaults(TablerMoon);
export const MoreVertical = withDefaults(TablerMoreVertical);
export const Navigation = withDefaults(TablerNavigation);
export const Package = withDefaults(TablerPackage);
export const Percent = withDefaults(TablerPercent);
export const Phone = withDefaults(TablerPhone);
export const Pill = withDefaults(TablerPill);
export const Play = withDefaults(TablerPlay);
export const Plus = withDefaults(TablerPlus);
export const Quote = withDefaults(TablerQuote);
export const RefreshCw = withDefaults(TablerRefreshCw);
export const Save = withDefaults(TablerSave);
export const Search = withDefaults(TablerSearch);
export const Send = withDefaults(TablerSend);
export const Settings = withDefaults(TablerSettings);
export const Shield = withDefaults(TablerShield);
export const ShieldCheck = withDefaults(TablerShieldCheck);
export const ShoppingBag = withDefaults(TablerShoppingBag);
export const ShoppingCart = withDefaults(TablerShoppingCart);
export const Smartphone = withDefaults(TablerSmartphone);
export const Sparkles = withDefaults(TablerSparkles);
export const Star = withDefaults(TablerStar);
export const Stethoscope = withDefaults(TablerStethoscope);
export const Store = withDefaults(TablerStore);
export const Sun = withDefaults(TablerSun);
export const Tag = withDefaults(TablerTag);
export const Thermometer = withDefaults(TablerThermometer);
export const Trash2 = withDefaults(TablerTrash2);
export const TrendingDown = withDefaults(TablerTrendingDown);
export const TrendingUp = withDefaults(TablerTrendingUp);
export const Truck = withDefaults(TablerTruck);
export const Type = withDefaults(TablerType);
export const Upload = withDefaults(TablerUpload);
export const User = withDefaults(TablerUser);
export const UserCheck = withDefaults(TablerUserCheck);
export const Users = withDefaults(TablerUsers);
export const Wallet = withDefaults(TablerWallet);
export const Wand2 = withDefaults(TablerWand2);
export const X = withDefaults(TablerX);
export const XCircle = withDefaults(TablerXCircle);
export const Zap = withDefaults(TablerZap);

// Semantic aliases (preferred for new code)
export const IconHome = Home;
export const IconShop = ShoppingBag;
export const IconCart = ShoppingCart;
export const IconAccount = User;
export const IconHealth = Sparkles;
export const IconBabyCare = BabyBottle;
export const IconAyurveda = Leaf;
export const IconSearch = Search;
export const IconUpload = Upload;
export const IconShield = ShieldCheck;
export const IconSupport = MessageCircle;
export const IconNavigation = Navigation;



