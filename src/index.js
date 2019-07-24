'use strict';
const pathToRegexp = require('path-to-regexp');
const name = '@react-router-breadCrumb@';
function breadCrumbMiddleware(crumbs) {
    return ({ dispatch, getState }) => {
        return function(next) {
            return function(action) {
                if (action.type === '@@router/LOCATION_CHANGE') {
                    if (typeof crumbs === 'function') {
                        crumbs = crumbs({ dispatch, getState }) || [];
                    }
                    if (!(typeof crumbs == 'object' && crumbs.constructor == Array)) {
                        throw new Error('breadCrumbs must be an array or method return array');
                    }
                    let pathname = action.payload.pathname;
                    let crumb = getBreadCrumb(pathname, crumbs);
                    dispatch({
                        type: `${name}CHANGE_BREAD_CRUMB`,
                        payload: crumb
                    });
                }
                return next(action);
            };
        };
    };
}
function breadCrumbReducer(state = [], action) {
    switch (action.type) {
        case `${name}CHANGE_BREAD_CRUMB`:
            state = action.payload;
            return state;
        default:
            return state;
    }
}
function getBreadCrumb(pathname, breadCrumbNames = []) {
    let props = {};
    let curBreadCrumb = null;
    breadCrumbNames.forEach(breadCrumb => {
        let matchPathPattern = getPathPattern(breadCrumb.path || '', props);
        let { re } = matchPathPattern;
        let match = re.exec(pathname);
        if (match) {
            curBreadCrumb = breadCrumb;
        }
    });
    return {
        match: curBreadCrumb,
        current: (curBreadCrumb && curBreadCrumb.crumbs) || null
    };
}
function getPathPattern(path, options) {
    let keys = [];
    let re = pathToRegexp(path, keys, options);
    return { re, keys };
}
export default {
    breadCrumbMiddleware,
    breadCrumbReducer
};
