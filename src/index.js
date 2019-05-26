import React, { Fragment } from "react";
import immer from "immer";

let CacheContext = React.createContext({});

const serialize = obj =>
  Object.entries(obj)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

const buildHeaders = options => {
  let headers = {
    Accept: "application/json, text/javascript",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  if (options) {
    return { ...headers, ...options };
  } else {
    return headers;
  }
};

const precondition = (condition, message = "Unmet precondition") => {
  if (!condition) {
    throw new Error(message);
  }
};

class CacheProvider extends React.Component {
  state = {
    cache: {}
  };

  onFetchRequest = url => {
    if (!this.state.cache[url]) {
      this.setState(state =>
        immer(state, mutable_state => {
          mutable_state.cache[url] = {
            url,
            requestTime: new Date(),
            resolvedTime: null,
            data: null,
            error: null,
            status: "loading"
          };
        })
      );
    }
  };

  onFetchResult = ({ url, ...rest }) => {
    this.setState(state => {
      if (state.cache[url]) {
        return immer(state, mutable_state => {
          let requestTime = mutable_state.cache[url].requestTime;
          mutable_state.cache[url] = {
            url,
            requestTime,
            ...rest,
            resolvedTime: new Date()
          };
        });
      }
    });
  };

  render() {
    return (
      <CacheContext.Provider
        value={{
          value: this.state.cache,
          onFetchRequest: this.onFetchRequest,
          onFetchResult: this.onFetchResult
        }}
      >
        {this.props.children}
      </CacheContext.Provider>
    );
  }
}

class FetchAction extends React.Component {
  async handleFetch() {
    const {
      method = "get",
      params = null,
      options = null,
      url
    } = this.props.element;
    const body = params ? serialize(params) : params;
    const headers = buildHeaders(options);

    try {
      const result = await fetch(url, {
        method,
        body,
        headers
      });

      const content_type = result.headers.get("content-type");
      precondition(
        content_type && content_type.includes("application/json"),
        "Response is not valid json"
      );
      const data = await result.json();
      this.props.action({
        url,
        data,
        error: null,
        status: "done"
      });
    } catch (error) {
      this.props.action({
        url,
        data: null,
        error: { message: error },
        status: "error"
      });
    }
  }

  componentDidMount() {
    this.handleFetch();
  }

  componentDidUpdate() {
    // Not sure if I'd need to handleFetch here too?
    // this.handleFetch();
  }

  render() {
    return null;
  }
}

const WithCache = ({ children }) => (
  <CacheContext.Consumer>{props => children(props)}</CacheContext.Consumer>
);

//One component to 'divide' all
const FetchRunner = () => (
  <WithCache>
    {({ value, onFetchResult }) =>
      Object.values(value)
        .filter(data => data.status === "loading")
        .map(element => (
          <FetchAction
            key={element.url}
            element={element}
            action={onFetchResult}
          />
        ))
    }
  </WithCache>
);
export const FetchJSONProvider = ({ children }) => (
  <CacheProvider>
    <Fragment>
      <FetchRunner />
      {children}
    </Fragment>
  </CacheProvider>
);

class HandleFetch extends React.Component {
  fetch() {
    this.props.action(this.props.url);
  }

  componentDidMount() {
    precondition(
      this.props.method == null || this.props.method === "get",
      "POST (non-get) request not yet implemented"
    );
    this.fetch();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.url !== this.props.url) {
      this.fetch();
    }
  }

  render() {
    return this.props.children;
  }
}

export const FetchJSON = ({ url, children }) => (
  <WithCache>
    {({ value, onFetchRequest }) => {
      let fetchObject = value[url];
      if (fetchObject) {
        return children(fetchObject);
      } else {
        return (
          <HandleFetch
            url={url}
            children={children({
              url,
              data: null,
              error: null,
              status: "loading"
            })}
            action={onFetchRequest}
          />
        );
      }
    }}
  </WithCache>
);
