import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "@/views/Login";
import Register from "@/views/Register";
import Admin from "@/views/Admin";
import HP from "@/views/HP";
import Find from "@/views/Find";
import DeletingPage from "@/component/DeletingPage";
import Comment from "../component/Comment";
import ReplyToThisComment from "../component/ReplyToThisComment";
import FilterWebsiteData from "../component/FilterWebsiteData";
import MyPageTop from "../component/MyPageTop";
import MyPageNotification from "../component/MyPageNotification";
import UserInfoList from "../component/UserInfoList";
import UserPage from "../views/UserPage";
import WebsiteSearchResults from "@/component/WebsiteSearchResults";
import TagSearchPage from "@/component/TagSearchPage";
import AllTags from "@/component/AllTags";
import FilterPage from "@/component/FilterPage";
import PopularBookmarks from "@/component/PopularBookmarks";
import AdminRegister from "@/component/AdminRegister";
import AdminNotification from "@/component/AdminNotification";
import AdminLog from "@/component/AdminLog";

Vue.use(VueRouter)

const routes = [
    {path: '/', redirect: '/home'},
    {path: "/login", component: Login},
    {path: "/register", component: Register},
    {
        path: "/admin",
        component: Admin,
        children: [
            {path: "admin-notification", component: AdminNotification},
            {path: "admin-log", component: AdminLog},
        ]
    },
    {path: "/admin-register", component: AdminRegister},
    {path: "/home", component: HP},
    {path: "/find", component: Find},
    {path: "/delete/:username", component: DeletingPage},
    {path: "/comment", component: Comment},
    {path: "/replyToThisComment", component: ReplyToThisComment},
    {path: "/filterWebsiteData", component: FilterWebsiteData},
    {path: "/myPageTop", component: MyPageTop},
    {path: "/myPageNotification", component: MyPageNotification},
    {path: "/userInfoList", component: UserInfoList},
    {path: "/user", component: UserPage},
    {path: "/web", component: WebsiteSearchResults, name: 'web', props: true},
    {path: "/tag-search", component: TagSearchPage, name: 'tag-search', props: true},
    {path: "/all-tags", component: AllTags},
    {path: "/filter", component: FilterPage},
    {path: "/popular", component: PopularBookmarks},
]

const router = new VueRouter({
    routes
})

export default router
