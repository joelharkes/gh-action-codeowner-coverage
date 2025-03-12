import type * as core from '@actions/core';
import { jest } from '@jest/globals';

export const debug = jest.fn<typeof core.debug>();
export const error = jest.fn<typeof core.error>();
export const info = jest.fn<typeof core.info>();
export const notice = jest.fn<typeof core.notice>();
export const getInput = jest.fn<typeof core.getInput>();
export const setOutput = jest.fn<typeof core.setOutput>();
export const setFailed = jest.fn<typeof core.setFailed>();
export const warning = jest.fn<typeof core.warning>();
export const startGroup = jest.fn<typeof core.startGroup>();
export const endGroup = jest.fn<typeof core.endGroup>();
export const isDebug = jest.fn<typeof core.isDebug>();
