import { useState } from "react";

export default function useWithLoading() {
  const [loading, setLoading] = useState(false);
  /**
   * Synchronous function call
   * @param functionToCall
   * @param successHandler
   * @param exceptionHandler
   */
  const withLoading = (functionToCall, successHandler, exceptionHandler) => {
    setLoading(true);
    functionToCall()
      .then((res) => {
        setLoading(false);
        successHandler(res);
      })
      .catch((err) => {
        exceptionHandler(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return [loading, withLoading];
}
