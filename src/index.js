import React from "react";

let CacheContext = React.createContext({});

const serialize = obj =>
  Object.entries(obj)
    .map(([key, value]) => 
    `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");

const buildHeaders = token => {
  let headers = {
    Accept: "application/json, text/javascript",
    "Content-Type": "application/x-www-form-urlencoded"
  };

  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  } else {
    return headers;
  }
};

const precondition = (condition, message = "Unmet precondition") => {
  if (!condition) {
    throw new Error(message);
  }
};

const Group = ({ children }) => React.Children.toArray(children);

class CacheProvider extends React.Component {
  state = {
    fetchList: [] //Fetch this from localStograge
  };

  reducer = (list, arg) => {
    if (list.find(data => data.url === arg.url)) {
      return list.map(data => {
        if (data.url === arg.url) {
          return arg;
        } else {
          return data;
        }
      });
    } else {
      return list.concat([
        {
          url: arg.url,
          data: null,
          error: null,
          status: "loading"
        }
      ]);
    }
  };

  handleUpdate = payload => {    
    this.setState(state => ({
      fetchList: this.reducer(state.fetchList, payload)
    }));
  };

  render() {
    return (
      <CacheContext.Provider
        value={{
          value: this.state.fetchList,
          onUpdate: this.handleUpdate
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
      token = "",
      url
    } = this.props.element;
    const body = params ? serialize(params) : params;
    const headers = buildHeaders(token);

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

//One component to 'divide' all
const FetchRunner = () => {
  return (
    <CacheContext.Consumer>
      {({ value, onUpdate }) => {
        return value
          .filter(data => data.status === "loading")
          .map(element => (
            <FetchAction
              key={element.url}
              element={element}
              action={onUpdate}
            />
          ));
      }}
    </CacheContext.Consumer>
  );
};

export const FetchJSONProvider = ({ children }) => (
  <CacheProvider>
    <Group>
      <FetchRunner />
      {children}
    </Group>
  </CacheProvider>
);

class HandleFetch extends React.Component {
  fetch() {
    this.props.action({
      url: this.props.url
    });
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

export const FetchJSON = ({ url, children }) => {
  return (
    <CacheContext.Consumer>
      {({ value, onUpdate }) => {
        let fetchObject = value.find(data => data.url === url);
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
              action={onUpdate}
            />
          );
        }
      }}
    </CacheContext.Consumer>
  );
};
