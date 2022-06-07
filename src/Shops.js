import './Shops.css'

function Shops (props) {
    if (props.shopList.length === 0 && props.zeroShopSearch === false) return null

    let shopListElements = props.shopList.map(el => (
        <div className="oneItem" key={el.url}>
            <a href={"http://"+el.url} target="_blank">{el.url}</a> {Math.round(el.price * 100) / 100} zł
        </div>
    ))

    return (
        <div className="flexContainer">
        <div className="box itemsPicked">
            <h4 id="boxInfo">Sklepy z wszystkimi wybranymi produktami oraz ich cena sumaryczna:</h4>
            <hr></hr>
            {props.wrongShops && <span className="tooMuchLessInfo">Sklepy dla ostatniego wyszukiwania, nie dla aktualnie wybranych produktów</span>}
            {shopListElements}
            {props.zeroShopSearch && <span className="zeroSearch">Nie znaleziono żadnego sklepu</span>}
        </div>
        </div>
    )
}

export default Shops