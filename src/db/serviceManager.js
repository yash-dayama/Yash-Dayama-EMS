const { TableNames } = require("../utils/constants");

const allServices = [
];
const mCascadeDelete = async function (tableName, deletedRecordIds = [], metaData = {}) {
    if (!Array.isArray(deletedRecordIds)) {
        deletedRecordIds = [deletedRecordIds];
    }
    deletedRecordIds = deletedRecordIds.filter((a) => a !== undefined);
    if (deletedRecordIds.length > 0) {
        if (this.ignoreSelfCall) {
            for (const a of allServices) {
                if (a[0] !== tableName) {
                    try {
                        await a[1](mCascadeDelete, tableName, deletedRecordIds, metaData);
                    } catch (e) {
                        console.error(`CascadeDelete Error (1) (${a[0]}):`, e);
                        throw e;
                    }
                }
            }
        } else {
            for (const a of allServices) {
                try {
                    await a[1](mCascadeDelete, tableName, deletedRecordIds, metaData);
                } catch (e) {
                    console.error(`CascadeDelete Error (2) (${a[0]}):`, e);
                    throw e;
                }
            }
        }
    }
};

exports.cascadeDelete = mCascadeDelete;
