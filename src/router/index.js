import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from "@/views/Login";
import Register from "@/views/Register";
import Admin from "@/views/Admin";
import HP from "@/views/HP";
import MyPage from "@/views/MyPage";
import Find from "@/views/Find";
import DeletingPage from "@/views/DeletingPage";
import Comment from "../component/Comment";
import ReplyToThisComment from "../component/ReplyToThisComment";
import FilterWebsiteData from "../component/FilterWebsiteData";
import MyPageTop from "../component/MyPageTop";
import MyPageNotification from "../component/MyPageNotification";
import UserInfoList from "../component/UserInfoList";
import UserPage from "../views/UserPage";

Vue.use(VueRouter)

const routes = [
    {path: '/', redirect: '/home'},
    {path: "/login", component: Login},
    {path: "/register", component: Register},
    {path: "/admin", component: Admin},
    {path: "/home", component: HP},
    {path: "/mypage", component: MyPage},
    {path: "/find", component: Find},
    {path: "/delete/:username", component: DeletingPage},
    {path: "/comment", component: Comment},
    {path: "/replyToThisComment", component: ReplyToThisComment},
    {path: "/filterWebsiteData", component: FilterWebsiteData},
    {path: "/myPageTop", component: MyPageTop},
    {path: "/myPageNotification", component: MyPageNotification},
    {path: "/userInfoList", component: UserInfoList},
    {path: "/user", component: UserPage},
]

const router = new VueRouter({
    routes
})

export default router
