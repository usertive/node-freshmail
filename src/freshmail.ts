const request = require("request");
const sha1 = require("sha1");

type CallbackType = (error: any, response: any, body?: any) => any;
type RequestOptions = {
  headers?: object;
};

class FreshMailRestApi {
  private readonly _apiKey: string;
  private readonly _apiSecret: string;
  private readonly _url: string;

  constructor(apiKey: string, apiSecret: string) {
    this._apiKey = apiKey;
    this._apiSecret = apiSecret;
    this._url = "https://api.freshmail.com/rest/";
  }

  async doRequest(
    urlString: string = "ping",
    requestData: any,
    callback?: CallbackType,
    requestOptions?: RequestOptions
  ): Promise<any> {
    const urlSlug = this.checkUrlString(urlString);
    const body = this.checkRequestBody(requestData);
    const url = this._url + urlSlug;

    const headers = {
      "Content-Type": "Application/json",
      ...(requestOptions && requestOptions.headers),
      "X-Rest-ApiKey": this._apiKey,
      "X-Rest-ApiSign": sha1(
        this._apiKey + `/rest/${urlSlug}` + body + this._apiSecret
      )
    };

    const options = {
      method: "POST",
      body,
      ...requestOptions,
      headers,
      url
    };

    return await request(options, callback);
  }

  private checkUrlString(urlString: string): string {
    let result = urlString;

    if (!urlString) {
      throw new Error("No freshmail api slug defined!");
    }

    if (/\/rest\//g.test(urlString)) {
      result.replace("/rest/", "");
    }

    return result;
  }

  // TODO: Refactor this
  private checkRequestBody(requestData: any): string {
    if (!requestData) {
      return "";
    }

    if (requestData && typeof requestData === "string") {
      return JSON.stringify(requestData);
    }

    const isObject =
      typeof requestData === "object" && requestData.constructor === Object;

    if (requestData && isObject && Object.entries(requestData).length === 0) {
      return "";
    }

    if (requestData && isObject && Object.entries(requestData).length > 0) {
      return JSON.stringify(requestData);
    }
    return "";
  }
}

module.exports = FreshMailRestApi;
