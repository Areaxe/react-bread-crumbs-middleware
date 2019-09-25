'use strict';
const pathToRegexp = require('path-to-regexp');
const name = '@react-router-breadCrumb@';
function breadCrumbMiddleware(crumbs) {
    return ({ dispatch, getState }) => {
        return function (next) {
            return function (action) {
                if (action.type === '@@router/LOCATION_CHANGE') {
                    if (typeof crumbs === 'function') {
                        crumbs = crumbs({ dispatch, getState }) || [];
                    }
                    if (!(typeof crumbs == 'object' && crumbs.constructor == Array)) {
                        throw new Error('breadCrumbs must be an array or method return array');
                    }
                    let pathname = action.payload.pathname || action.payload.location.pathname;
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
            state = action.payload || [];
            return state;
        default:
            return state;
    }
}

function getBreadCrumb(pathname, breadCrumbNames) {
    let props = {};
    let curBreadCrumb = null;

    breadCrumbNames.forEach(breadCrumb => {
        if(!breadCrumb.hasOwnProperty('path')){
            return null
        }
        let matchPathPattern = getPathPattern(breadCrumb.path, props);
        let { re, keys } = matchPathPattern;

        let match = re.exec(pathname);
        if (match) {
            let values = match.slice(1);

            let params = keys.reduce(function (memo, key, index) {
                memo[key.name] = values[index];
                return memo;
            }, {});

            breadCrumb.crumbs && breadCrumb.crumbs.forEach(item => {
                if (item.link && item.link.indexOf(':') >= 0) { 
                    let linkParams = getPathPattern(item.link).keys;
                    linkParams.forEach(key => {
                        let data = params[key.name];
                        if (data) {
                            item.link = item.link.replace(`/:${key.name}/`, `/${data}/`);
                        }
                    });
                }
            });

            curBreadCrumb = breadCrumb.crumbs;
        }
    });

    return curBreadCrumb ? curBreadCrumb : null;
}

function getPathPattern(path, options) {
    let keys = [];
    let re = pathToRegexp(path, keys, options);
    return { re, keys };
}

exports.breadCrumbMiddleware = breadCrumbMiddleware;
exports.breadCrumbReducer = breadCrumbReducer;
