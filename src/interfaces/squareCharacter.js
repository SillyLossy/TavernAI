/**
 * SquareCharacter 状态枚举
 * @readonly
 * @enum {string}
 */
export const squareCharacterStatus = {
    /** 待审核 */
    PENDING: 'pending',
    /** 生效 */
    ACTIVE: 'active',
    /** 下架 */
    INACTIVE: 'inactive',
};

/**
 * 获取所有状态值数组
 * @returns {string[]} 状态值数组
 */
export function getSquareCharacterStatusValues() {
    return Object.values(squareCharacterStatus);
}
