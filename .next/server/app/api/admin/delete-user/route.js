"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/admin/delete-user/route";
exports.ids = ["app/api/admin/delete-user/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fdelete-user%2Froute&page=%2Fapi%2Fadmin%2Fdelete-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fdelete-user%2Froute.ts&appDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fdelete-user%2Froute&page=%2Fapi%2Fadmin%2Fdelete-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fdelete-user%2Froute.ts&appDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \***********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_jleme_CascadeProjects_melbalapp_src_app_api_admin_delete_user_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/admin/delete-user/route.ts */ \"(rsc)/./src/app/api/admin/delete-user/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admin/delete-user/route\",\n        pathname: \"/api/admin/delete-user\",\n        filename: \"route\",\n        bundlePath: \"app/api/admin/delete-user/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\jleme\\\\CascadeProjects\\\\melbalapp\\\\src\\\\app\\\\api\\\\admin\\\\delete-user\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_jleme_CascadeProjects_melbalapp_src_app_api_admin_delete_user_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/admin/delete-user/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbiUyRmRlbGV0ZS11c2VyJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhZG1pbiUyRmRlbGV0ZS11c2VyJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYWRtaW4lMkZkZWxldGUtdXNlciUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNqbGVtZSU1Q0Nhc2NhZGVQcm9qZWN0cyU1Q21lbGJhbGFwcCU1Q3NyYyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDamxlbWUlNUNDYXNjYWRlUHJvamVjdHMlNUNtZWxiYWxhcHAmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ3lDO0FBQ3RIO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbWVsYmFsYXBwLz9lMzQxIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXGpsZW1lXFxcXENhc2NhZGVQcm9qZWN0c1xcXFxtZWxiYWxhcHBcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcYWRtaW5cXFxcZGVsZXRlLXVzZXJcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2FkbWluL2RlbGV0ZS11c2VyL3JvdXRlXCIsXG4gICAgICAgIHBhdGhuYW1lOiBcIi9hcGkvYWRtaW4vZGVsZXRlLXVzZXJcIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2FkbWluL2RlbGV0ZS11c2VyL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcamxlbWVcXFxcQ2FzY2FkZVByb2plY3RzXFxcXG1lbGJhbGFwcFxcXFxzcmNcXFxcYXBwXFxcXGFwaVxcXFxhZG1pblxcXFxkZWxldGUtdXNlclxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHJlcXVlc3RBc3luY1N0b3JhZ2UsIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmNvbnN0IG9yaWdpbmFsUGF0aG5hbWUgPSBcIi9hcGkvYWRtaW4vZGVsZXRlLXVzZXIvcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fdelete-user%2Froute&page=%2Fapi%2Fadmin%2Fdelete-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fdelete-user%2Froute.ts&appDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/admin/delete-user/route.ts":
/*!************************************************!*\
  !*** ./src/app/api/admin/delete-user/route.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   DELETE: () => (/* binding */ DELETE)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\n\n// Client admin avec service_role key pour supprimer des utilisateurs\nconst supabaseAdmin = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(\"https://datjoleofcjcpejnhddd.supabase.co\", process.env.SUPABASE_SERVICE_ROLE_KEY || \"\", {\n    auth: {\n        autoRefreshToken: false,\n        persistSession: false\n    }\n});\nasync function DELETE(request) {\n    try {\n        const { userId } = await request.json();\n        if (!userId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"ID utilisateur requis\"\n            }, {\n                status: 400\n            });\n        }\n        // Supprimer l'utilisateur de l'authentification Supabase\n        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);\n        if (authError) {\n            console.error(\"Erreur suppression auth:\", authError);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Erreur de suppression utilisateur\",\n                details: authError.message\n            }, {\n                status: 400\n            });\n        }\n        // Le profil sera automatiquement supprimé par la cascade de suppression\n        // ou par un trigger de base de données\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            message: \"Utilisateur supprim\\xe9 avec succ\\xe8s\"\n        });\n    } catch (error) {\n        console.error(\"Erreur serveur:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erreur serveur\",\n            details: error instanceof Error ? error.message : \"Erreur inconnue\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hZG1pbi9kZWxldGUtdXNlci9yb3V0ZS50cyIsIm1hcHBpbmdzIjoiOzs7Ozs7QUFBdUQ7QUFDSDtBQUVwRCxxRUFBcUU7QUFDckUsTUFBTUUsZ0JBQWdCRCxtRUFBWUEsQ0FDaEMsNENBQ0FFLFFBQVFDLEdBQUcsQ0FBQ0MseUJBQXlCLElBQUksSUFDekM7SUFDRUMsTUFBTTtRQUNKQyxrQkFBa0I7UUFDbEJDLGdCQUFnQjtJQUNsQjtBQUNGO0FBR0ssZUFBZUMsT0FBT0MsT0FBb0I7SUFDL0MsSUFBSTtRQUNGLE1BQU0sRUFBRUMsTUFBTSxFQUFFLEdBQUcsTUFBTUQsUUFBUUUsSUFBSTtRQUVyQyxJQUFJLENBQUNELFFBQVE7WUFDWCxPQUFPWCxxREFBWUEsQ0FBQ1ksSUFBSSxDQUFDO2dCQUFFQyxPQUFPO1lBQXdCLEdBQUc7Z0JBQUVDLFFBQVE7WUFBSTtRQUM3RTtRQUVBLHlEQUF5RDtRQUN6RCxNQUFNLEVBQUVELE9BQU9FLFNBQVMsRUFBRSxHQUFHLE1BQU1iLGNBQWNJLElBQUksQ0FBQ1UsS0FBSyxDQUFDQyxVQUFVLENBQUNOO1FBRXZFLElBQUlJLFdBQVc7WUFDYkcsUUFBUUwsS0FBSyxDQUFDLDRCQUE0QkU7WUFDMUMsT0FBT2YscURBQVlBLENBQUNZLElBQUksQ0FBQztnQkFDdkJDLE9BQU87Z0JBQ1BNLFNBQVNKLFVBQVVLLE9BQU87WUFDNUIsR0FBRztnQkFBRU4sUUFBUTtZQUFJO1FBQ25CO1FBRUEsd0VBQXdFO1FBQ3hFLHVDQUF1QztRQUV2QyxPQUFPZCxxREFBWUEsQ0FBQ1ksSUFBSSxDQUFDO1lBQ3ZCUyxTQUFTO1lBQ1RELFNBQVM7UUFDWDtJQUVGLEVBQUUsT0FBT1AsT0FBTztRQUNkSyxRQUFRTCxLQUFLLENBQUMsbUJBQW1CQTtRQUNqQyxPQUFPYixxREFBWUEsQ0FBQ1ksSUFBSSxDQUFDO1lBQ3ZCQyxPQUFPO1lBQ1BNLFNBQVNOLGlCQUFpQlMsUUFBUVQsTUFBTU8sT0FBTyxHQUFHO1FBQ3BELEdBQUc7WUFBRU4sUUFBUTtRQUFJO0lBQ25CO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9tZWxiYWxhcHAvLi9zcmMvYXBwL2FwaS9hZG1pbi9kZWxldGUtdXNlci9yb3V0ZS50cz80MTE3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcblxuLy8gQ2xpZW50IGFkbWluIGF2ZWMgc2VydmljZV9yb2xlIGtleSBwb3VyIHN1cHByaW1lciBkZXMgdXRpbGlzYXRldXJzXG5jb25zdCBzdXBhYmFzZUFkbWluID0gY3JlYXRlQ2xpZW50KFxuICAnaHR0cHM6Ly9kYXRqb2xlb2ZjamNwZWpuaGRkZC5zdXBhYmFzZS5jbycsXG4gIHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgfHwgJycsXG4gIHtcbiAgICBhdXRoOiB7XG4gICAgICBhdXRvUmVmcmVzaFRva2VuOiBmYWxzZSxcbiAgICAgIHBlcnNpc3RTZXNzaW9uOiBmYWxzZVxuICAgIH1cbiAgfVxuKVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gREVMRVRFKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyB1c2VySWQgfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpXG5cbiAgICBpZiAoIXVzZXJJZCkge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdJRCB1dGlsaXNhdGV1ciByZXF1aXMnIH0sIHsgc3RhdHVzOiA0MDAgfSlcbiAgICB9XG5cbiAgICAvLyBTdXBwcmltZXIgbCd1dGlsaXNhdGV1ciBkZSBsJ2F1dGhlbnRpZmljYXRpb24gU3VwYWJhc2VcbiAgICBjb25zdCB7IGVycm9yOiBhdXRoRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlQWRtaW4uYXV0aC5hZG1pbi5kZWxldGVVc2VyKHVzZXJJZClcbiAgICBcbiAgICBpZiAoYXV0aEVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJldXIgc3VwcHJlc3Npb24gYXV0aDonLCBhdXRoRXJyb3IpXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBcbiAgICAgICAgZXJyb3I6ICdFcnJldXIgZGUgc3VwcHJlc3Npb24gdXRpbGlzYXRldXInLCBcbiAgICAgICAgZGV0YWlsczogYXV0aEVycm9yLm1lc3NhZ2UgXG4gICAgICB9LCB7IHN0YXR1czogNDAwIH0pXG4gICAgfVxuXG4gICAgLy8gTGUgcHJvZmlsIHNlcmEgYXV0b21hdGlxdWVtZW50IHN1cHByaW3DqSBwYXIgbGEgY2FzY2FkZSBkZSBzdXBwcmVzc2lvblxuICAgIC8vIG91IHBhciB1biB0cmlnZ2VyIGRlIGJhc2UgZGUgZG9ubsOpZXNcblxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IFxuICAgICAgc3VjY2VzczogdHJ1ZSwgXG4gICAgICBtZXNzYWdlOiAnVXRpbGlzYXRldXIgc3VwcHJpbcOpIGF2ZWMgc3VjY8OocycgXG4gICAgfSlcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0VycmV1ciBzZXJ2ZXVyOicsIGVycm9yKVxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IFxuICAgICAgZXJyb3I6ICdFcnJldXIgc2VydmV1cicsIFxuICAgICAgZGV0YWlsczogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnRXJyZXVyIGluY29ubnVlJyBcbiAgICB9LCB7IHN0YXR1czogNTAwIH0pXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJjcmVhdGVDbGllbnQiLCJzdXBhYmFzZUFkbWluIiwicHJvY2VzcyIsImVudiIsIlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkiLCJhdXRoIiwiYXV0b1JlZnJlc2hUb2tlbiIsInBlcnNpc3RTZXNzaW9uIiwiREVMRVRFIiwicmVxdWVzdCIsInVzZXJJZCIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImF1dGhFcnJvciIsImFkbWluIiwiZGVsZXRlVXNlciIsImNvbnNvbGUiLCJkZXRhaWxzIiwibWVzc2FnZSIsInN1Y2Nlc3MiLCJFcnJvciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/admin/delete-user/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fadmin%2Fdelete-user%2Froute&page=%2Fapi%2Fadmin%2Fdelete-user%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmin%2Fdelete-user%2Froute.ts&appDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();