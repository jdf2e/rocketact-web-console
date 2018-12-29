import axios, { AxiosResponse } from "axios";

import { IDependency } from "../../server/dependenciesAPI";
import { IPackage } from "../components/PackageInstaller";

export interface IPackageDetail {
  description: string;
  "dist-tags": {
    latest: string;
    next: string;
  };
  homepage: string;
  versions: string[];
}

export interface ISearchResult {
  total: number;
  objects: Array<{ package: IPackage }>;
}

const API_BASE = "/ROCKETACT_WEB_CONSOLE/api";

function handleResponse(response: AxiosResponse<any>) {
  if (response.data.success) {
    return response.data.data;
  }

  throw new Error();
}

function getProject() {
  return axios.get(`${API_BASE}/project`).then(handleResponse);
}

function getPages() {
  return axios.get(`${API_BASE}/pages`).then(handleResponse);
}

function getDependencies(): Promise<{
  main: IDependency[];
  dev: IDependency[];
}> {
  return axios.get(`${API_BASE}/dependencies`).then(handleResponse);
}

function searchNPM(
  keyword: string,
  page: number,
  pageSize: number = 10
): Promise<ISearchResult> {
  return axios
    .get("http://registry.npmjs.org/-/v1/search", {
      params: {
        text: keyword,
        size: pageSize,
        from: (page - 1) * pageSize
      }
    })
    .then(response => response.data);
}

function getNPMPackageDetail(name: string): Promise<IPackageDetail> {
  return axios
    .get(`${API_BASE}/dependencies/npmPackageDetail?name=${name}`)
    .then(response => response.data)
    .then(response => {
      if (response.success) {
        response.data.versions = Object.values(response.data.versions);

        return response.data as IPackageDetail;
      }

      throw new Error();
    });
}

function install(
  name: string,
  options: {
    version?: string;
    isDev: boolean;
  }
) {
  return axios
    .post(`${API_BASE}/dependencies/install`, { ...options, name })
    .then(handleResponse);
}

function uninstall(name: string) {
  return axios
    .post(`${API_BASE}/dependencies/uninstall`, { name })
    .then(handleResponse);
}

export {
  getProject,
  getPages,
  getDependencies,
  searchNPM,
  getNPMPackageDetail,
  install,
  uninstall
};
