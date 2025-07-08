const express = require("express");
const adminAuth = require("../middleware/adminAuth");
const { ResponseStatus } = require("../utils/constants");
const ValidationError = require("../utils/ValidationError");

class API {
    static configRoute(root) {
        const router = new express.Router();

        return new PathBuilder(root, router);
    }
}

const MethodBuilder = class {
    constructor(root, subPath, router) {
        this.asGET = function (methodToExecute) {
            return new Builder("get", root, subPath, methodToExecute, router);
        };

        this.asPOST = function (methodToExecute) {
            return new Builder("post", root, subPath, methodToExecute, router);
        };

        this.asDELETE = function (methodToExecute) {
            return new Builder("delete", root, subPath, methodToExecute, router);
        };

        this.asUPDATE = function (methodToExecute) {
            return new Builder("patch", root, subPath, methodToExecute, router);
        };
    }
};

const PathBuilder = class {
    constructor(root, router) {
        this.addPath = function (subPath) {
            return new MethodBuilder(root, subPath, router);
        };
        this.getRouter = () => router;
        this.changeRoot = (newRoot) => {
            root = newRoot;

            return this;
        };
    }
};

const Builder = class {
    constructor(
        methodType,
        root,
        subPath,
        executer,
        router,
        useAuthMiddleware,
        duplicateErrorHandler,
        middlewaresList = [],
        useAdminAuth = false,
    ) {
        this.useAdminAuth = () =>
            new Builder(
                methodType,
                root,
                subPath,
                executer,
                router,
                useAuthMiddleware,
                duplicateErrorHandler,
                middlewaresList,
                true,
            );

        this.setDuplicateErrorHandler = (mDuplicateErrorHandler) =>
            new Builder(
                methodType,
                root,
                subPath,
                executer,
                router,
                useAuthMiddleware,
                mDuplicateErrorHandler,
                middlewaresList,
                useAdminAuth,
            );

        this.userMiddlewares = (...middlewares) => {
            middlewaresList = [...middlewares];

            return new Builder(
                methodType,
                root,
                subPath,
                executer,
                router,
                useAuthMiddleware,
                duplicateErrorHandler,
                middlewaresList,
                useAdminAuth,
            );
        };

        this.build = () => {
            const controller = async (req, res) => {
                try {
                    const response = await executer(req, res);

                    res.status(ResponseStatus.Success).send(response);
                } catch (e) {
                    console.log(e);
                    if (e && duplicateErrorHandler) {
                        res.locals.errorMessage = e.message;
                        // eslint-disable-next-line max-len
                      res.status(ResponseStatus.InternalServerError).send({
                            error: duplicateErrorHandler(e),
                        });
                    } else {
                        if (e && e.name !== ValidationError.name) {
                            console.log(e);
                        }
                        res.locals.errorMessage = e;
                        res.status(ResponseStatus.BadRequest).send({error: e})
                    }
                }
            };

            const middlewares = [...middlewaresList];

            if (useAdminAuth) {
                middlewares.push(adminAuth);
            }

            router[methodType](root + subPath, ...middlewares, controller);

            return new PathBuilder(root, router);
        };
    }
};

module.exports = API;
