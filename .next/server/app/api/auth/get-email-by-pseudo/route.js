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
exports.id = "app/api/auth/get-email-by-pseudo/route";
exports.ids = ["app/api/auth/get-email-by-pseudo/route"];
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

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute&page=%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute.ts&appDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute&page=%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute.ts&appDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_jleme_CascadeProjects_melbalapp_src_app_api_auth_get_email_by_pseudo_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/app/api/auth/get-email-by-pseudo/route.ts */ \"(rsc)/./src/app/api/auth/get-email-by-pseudo/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/get-email-by-pseudo/route\",\n        pathname: \"/api/auth/get-email-by-pseudo\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/get-email-by-pseudo/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\jleme\\\\CascadeProjects\\\\melbalapp\\\\src\\\\app\\\\api\\\\auth\\\\get-email-by-pseudo\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_jleme_CascadeProjects_melbalapp_src_app_api_auth_get_email_by_pseudo_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/get-email-by-pseudo/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGZ2V0LWVtYWlsLWJ5LXBzZXVkbyUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGYXV0aCUyRmdldC1lbWFpbC1ieS1wc2V1ZG8lMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZhdXRoJTJGZ2V0LWVtYWlsLWJ5LXBzZXVkbyUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNqbGVtZSU1Q0Nhc2NhZGVQcm9qZWN0cyU1Q21lbGJhbGFwcCU1Q3NyYyU1Q2FwcCZwYWdlRXh0ZW5zaW9ucz10c3gmcGFnZUV4dGVuc2lvbnM9dHMmcGFnZUV4dGVuc2lvbnM9anN4JnBhZ2VFeHRlbnNpb25zPWpzJnJvb3REaXI9QyUzQSU1Q1VzZXJzJTVDamxlbWUlNUNDYXNjYWRlUHJvamVjdHMlNUNtZWxiYWxhcHAmaXNEZXY9dHJ1ZSZ0c2NvbmZpZ1BhdGg9dHNjb25maWcuanNvbiZiYXNlUGF0aD0mYXNzZXRQcmVmaXg9Jm5leHRDb25maWdPdXRwdXQ9JnByZWZlcnJlZFJlZ2lvbj0mbWlkZGxld2FyZUNvbmZpZz1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFzRztBQUN2QztBQUNjO0FBQ2dEO0FBQzdIO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnSEFBbUI7QUFDM0M7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxZQUFZO0FBQ1osQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsaUVBQWlFO0FBQ3pFO0FBQ0E7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDdUg7O0FBRXZIIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbWVsYmFsYXBwLz85YjI3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXGpsZW1lXFxcXENhc2NhZGVQcm9qZWN0c1xcXFxtZWxiYWxhcHBcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFxnZXQtZW1haWwtYnktcHNldWRvXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hdXRoL2dldC1lbWFpbC1ieS1wc2V1ZG8vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hdXRoL2dldC1lbWFpbC1ieS1wc2V1ZG9cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgvZ2V0LWVtYWlsLWJ5LXBzZXVkby9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkM6XFxcXFVzZXJzXFxcXGpsZW1lXFxcXENhc2NhZGVQcm9qZWN0c1xcXFxtZWxiYWxhcHBcXFxcc3JjXFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFxnZXQtZW1haWwtYnktcHNldWRvXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgcmVxdWVzdEFzeW5jU3RvcmFnZSwgc3RhdGljR2VuZXJhdGlvbkFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuY29uc3Qgb3JpZ2luYWxQYXRobmFtZSA9IFwiL2FwaS9hdXRoL2dldC1lbWFpbC1ieS1wc2V1ZG8vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute&page=%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute.ts&appDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./src/app/api/auth/get-email-by-pseudo/route.ts":
/*!*******************************************************!*\
  !*** ./src/app/api/auth/get-email-by-pseudo/route.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\n\nconst supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;\nconst supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\n// Client admin avec la clé de service\nconst supabaseAdmin = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(supabaseUrl, supabaseServiceKey, {\n    auth: {\n        autoRefreshToken: false,\n        persistSession: false\n    }\n});\nasync function POST(request) {\n    try {\n        const { pseudo } = await request.json();\n        if (!pseudo) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Pseudo requis\"\n            }, {\n                status: 400\n            });\n        }\n        // Chercher l'utilisateur par pseudo dans les métadonnées\n        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();\n        if (error) {\n            console.error(\"Erreur lors de la recherche utilisateur:\", error);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Erreur de recherche\"\n            }, {\n                status: 500\n            });\n        }\n        const user = users.find((u)=>u.user_metadata?.username === pseudo);\n        if (!user) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Utilisateur introuvable\"\n            }, {\n                status: 404\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            email: user.email\n        });\n    } catch (error) {\n        console.error(\"Erreur API get-email-by-pseudo:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Erreur interne du serveur\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9zcmMvYXBwL2FwaS9hdXRoL2dldC1lbWFpbC1ieS1wc2V1ZG8vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQXVEO0FBQ0g7QUFFcEQsTUFBTUUsY0FBY0MsUUFBUUMsR0FBRyxDQUFDQyx3QkFBd0I7QUFDeEQsTUFBTUMscUJBQXFCSCxRQUFRQyxHQUFHLENBQUNHLHlCQUF5QjtBQUVoRSxzQ0FBc0M7QUFDdEMsTUFBTUMsZ0JBQWdCUCxtRUFBWUEsQ0FBQ0MsYUFBYUksb0JBQW9CO0lBQ2xFRyxNQUFNO1FBQ0pDLGtCQUFrQjtRQUNsQkMsZ0JBQWdCO0lBQ2xCO0FBQ0Y7QUFFTyxlQUFlQyxLQUFLQyxPQUFvQjtJQUM3QyxJQUFJO1FBQ0YsTUFBTSxFQUFFQyxNQUFNLEVBQUUsR0FBRyxNQUFNRCxRQUFRRSxJQUFJO1FBRXJDLElBQUksQ0FBQ0QsUUFBUTtZQUNYLE9BQU9kLHFEQUFZQSxDQUFDZSxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQWdCLEdBQ3pCO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSx5REFBeUQ7UUFDekQsTUFBTSxFQUFFQyxNQUFNLEVBQUVDLEtBQUssRUFBRSxFQUFFSCxLQUFLLEVBQUUsR0FBRyxNQUFNUixjQUFjQyxJQUFJLENBQUNXLEtBQUssQ0FBQ0MsU0FBUztRQUUzRSxJQUFJTCxPQUFPO1lBQ1RNLFFBQVFOLEtBQUssQ0FBQyw0Q0FBNENBO1lBQzFELE9BQU9oQixxREFBWUEsQ0FBQ2UsSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUFzQixHQUMvQjtnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsTUFBTU0sT0FBT0osTUFBTUssSUFBSSxDQUFDQyxDQUFBQSxJQUFLQSxFQUFFQyxhQUFhLEVBQUVDLGFBQWFiO1FBRTNELElBQUksQ0FBQ1MsTUFBTTtZQUNULE9BQU92QixxREFBWUEsQ0FBQ2UsSUFBSSxDQUN0QjtnQkFBRUMsT0FBTztZQUEwQixHQUNuQztnQkFBRUMsUUFBUTtZQUFJO1FBRWxCO1FBRUEsT0FBT2pCLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7WUFDdkJhLFNBQVM7WUFDVEMsT0FBT04sS0FBS00sS0FBSztRQUNuQjtJQUVGLEVBQUUsT0FBT2IsT0FBTztRQUNkTSxRQUFRTixLQUFLLENBQUMsbUNBQW1DQTtRQUNqRCxPQUFPaEIscURBQVlBLENBQUNlLElBQUksQ0FDdEI7WUFBRUMsT0FBTztRQUE0QixHQUNyQztZQUFFQyxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL21lbGJhbGFwcC8uL3NyYy9hcHAvYXBpL2F1dGgvZ2V0LWVtYWlsLWJ5LXBzZXVkby9yb3V0ZS50cz8xMGY2Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0LCBOZXh0UmVzcG9uc2UgfSBmcm9tICduZXh0L3NlcnZlcidcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzdXBhYmFzZS9zdXBhYmFzZS1qcydcblxuY29uc3Qgc3VwYWJhc2VVcmwgPSBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwhXG5jb25zdCBzdXBhYmFzZVNlcnZpY2VLZXkgPSBwcm9jZXNzLmVudi5TVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIVxuXG4vLyBDbGllbnQgYWRtaW4gYXZlYyBsYSBjbMOpIGRlIHNlcnZpY2VcbmNvbnN0IHN1cGFiYXNlQWRtaW4gPSBjcmVhdGVDbGllbnQoc3VwYWJhc2VVcmwsIHN1cGFiYXNlU2VydmljZUtleSwge1xuICBhdXRoOiB7XG4gICAgYXV0b1JlZnJlc2hUb2tlbjogZmFsc2UsXG4gICAgcGVyc2lzdFNlc3Npb246IGZhbHNlXG4gIH1cbn0pXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBQT1NUKHJlcXVlc3Q6IE5leHRSZXF1ZXN0KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBwc2V1ZG8gfSA9IGF3YWl0IHJlcXVlc3QuanNvbigpXG5cbiAgICBpZiAoIXBzZXVkbykge1xuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnUHNldWRvIHJlcXVpcycgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgLy8gQ2hlcmNoZXIgbCd1dGlsaXNhdGV1ciBwYXIgcHNldWRvIGRhbnMgbGVzIG3DqXRhZG9ubsOpZXNcbiAgICBjb25zdCB7IGRhdGE6IHsgdXNlcnMgfSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlQWRtaW4uYXV0aC5hZG1pbi5saXN0VXNlcnMoKVxuICAgIFxuICAgIGlmIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyZXVyIGxvcnMgZGUgbGEgcmVjaGVyY2hlIHV0aWxpc2F0ZXVyOicsIGVycm9yKVxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgICB7IGVycm9yOiAnRXJyZXVyIGRlIHJlY2hlcmNoZScgfSxcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgdXNlciA9IHVzZXJzLmZpbmQodSA9PiB1LnVzZXJfbWV0YWRhdGE/LnVzZXJuYW1lID09PSBwc2V1ZG8pXG4gICAgXG4gICAgaWYgKCF1c2VyKSB7XG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXG4gICAgICAgIHsgZXJyb3I6ICdVdGlsaXNhdGV1ciBpbnRyb3V2YWJsZScgfSxcbiAgICAgICAgeyBzdGF0dXM6IDQwNCB9XG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcbiAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICBlbWFpbDogdXNlci5lbWFpbFxuICAgIH0pXG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJldXIgQVBJIGdldC1lbWFpbC1ieS1wc2V1ZG86JywgZXJyb3IpXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKFxuICAgICAgeyBlcnJvcjogJ0VycmV1ciBpbnRlcm5lIGR1IHNlcnZldXInIH0sXG4gICAgICB7IHN0YXR1czogNTAwIH1cbiAgICApXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJjcmVhdGVDbGllbnQiLCJzdXBhYmFzZVVybCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJzdXBhYmFzZVNlcnZpY2VLZXkiLCJTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIiwic3VwYWJhc2VBZG1pbiIsImF1dGgiLCJhdXRvUmVmcmVzaFRva2VuIiwicGVyc2lzdFNlc3Npb24iLCJQT1NUIiwicmVxdWVzdCIsInBzZXVkbyIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImRhdGEiLCJ1c2VycyIsImFkbWluIiwibGlzdFVzZXJzIiwiY29uc29sZSIsInVzZXIiLCJmaW5kIiwidSIsInVzZXJfbWV0YWRhdGEiLCJ1c2VybmFtZSIsInN1Y2Nlc3MiLCJlbWFpbCJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./src/app/api/auth/get-email-by-pseudo/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute&page=%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Fget-email-by-pseudo%2Froute.ts&appDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp%5Csrc%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Cjleme%5CCascadeProjects%5Cmelbalapp&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();