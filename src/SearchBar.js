import "./SearchBar.css";

function SearchBar(props) {
  return (
    <form onSubmit={(e) => props.handleSubmit(e)}>
      <input
        className="input is-primary"
        type="text"
        name="productName"
        placeholder="Nazwa Produktu"
        value={props.searchInputVal}
        onChange={(e) => props.handleChange(e)}
      />
      {props.loading ? (
        <progress
          className="productProgress progress is-small is-primary"
          max="100"
        >
          15%
        </progress>
      ) : (
        <progress
          className="productProgress progress is-small is-primary"
          max="100"
          value="0"
        >
          15%
        </progress>
      )}
    </form>
  );
}

export default SearchBar;
