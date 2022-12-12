import "./ItemsPicked.css";

function ItemsPicked(props) {
  let itemListElements = props.itemList.map((el) => (
    <div className="oneItem" key={el.id}>
      <span>
        <a href={"https://www.ceneo.pl/" + el.id} target="_blank">
          {el.name}
        </a>
      </span>
      <button
        className="delete"
        onClick={(e) => props.handleDeleteItem(el.id)}
      ></button>
    </div>
  ));
  return (
    <div className="flexContainer">
      <div className="box itemsPicked itemsPickedREAL">
        <h4 id="boxInfo">Wybrane produkty:</h4>
        <hr></hr>
        {itemListElements}
        {props.itemList.length !== 0 && (
          <button
            className="button is-primary searchButton"
            disabled={props.tooLessMuchProducts}
            onClick={(e) => props.handleSearchShops()}
          >
            Wyszukaj sklepy
          </button>
        )}
        {props.itemList.length !== 0 && props.tooLessMuchProducts && (
          <span className="tooMuchLessInfo">
            Liczba produktów musi być większa niż 1 i mniejsza niż 5
          </span>
        )}
      </div>
    </div>
  );
}

export default ItemsPicked;
