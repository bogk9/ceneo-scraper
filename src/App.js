import React from 'react'
import axios from 'axios'
import 'bulma/css/bulma.min.css';
import './App.css'
import SearchBar from './SearchBar'
import Propositions from './Propositions'
import ItemsPicked from './ItemsPicked'
import Shops from './Shops'

class App extends React.Component {
  
  constructor(props) {
    super(props)
    //itemList, tooMuchProducts, propositions <= dummy data
    this.state = {
      searchInputVal: "",
      showPropositions: false,
      // propositions: [{name: "Apple iPhone 11 64GB Biały", id: "85615970"}, {name: "Laptop Apple MacBook Air 13,3\"/M1/8GB/256GB/macOS (MGN63ZEA)", id: "99105003"}, {name: "Apple iPhone 11 64GB Czarny", id: "85615932"}, {name: "Laptop Apple MacBook Air 13,3\"/M1/16GB/256GB/macOS (MGN63ZEAR1)", id: "99146328"}, {name: "Apple Mac Mini (MGNR3ZEA)", id: "99105019"}],
      propositions: [],
      loading: false,
      itemList: [],
      // itemList: [{name: "Apple iPhone 11 64GB Biały", id: "85615970"}, {name: "Laptop Apple MacBook Air 13,3\"/M1/8GB/256GB/macOS (MGN63ZEA)", id: "99105003"}, {name: "Apple iPhone 11 64GB Czarny", id: "85615932"}, {name: "Laptop Apple MacBook Air 13,3\"/M1/16GB/256GB/macOS (MGN63ZEAR1)", id: "99146328"}, {name: "Apple Mac Mini (MGNR3ZEA)", id: "99105019"}],
      shopList: [],
      // shopList: [{"url":"taniaksiazka.pl","price":70.78},{"url":"matfel.pl","price":68.91},{"url":"smakliter.pl","price":62.71000000000001},{"url":"multiszop.pl","price":63.24},{"url":"allegro.pl","price":63.24},{"url":"dadada.pl","price":64.81},{"url":"czytam.pl","price":66.25999999999999},{"url":"ameo.pl","price":67.28999999999999},{"url":"gandalf.com.pl","price":67.56},{"url":"naukowa.pl","price":69.06},{"url":"megaksiazki.pl","price":71.28},{"url":"inverso.pl","price":75.94999999999999},{"url":"morele.net","price":82.65},{"url":"dvdmax.pl","price":92.98},{"url":"ksiegibarneja.pl","price":98.21000000000001},{"url":"punkt44.pl","price":99.49000000000001}],
      tooLessMuchProducts: true,
      wrongShops: false,
      zeroProductSearch: false,
      zeroShopSearch: false,
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handlePropositionClick = this.handlePropositionClick.bind(this)
    this.handleDeleteItem = this.handleDeleteItem.bind(this)
    this.handleSearchShops = this.handleSearchShops.bind(this)
  }

  handleChange(event) {
    this.setState(prevState => ({
      ...prevState,
      searchInputVal: event.target.value,
    }))
  }

  handleSubmit(event) {
    event.preventDefault()
    this.setState(prevState => ({
      ...prevState,
      loading: true,
      propositions: []
    }))
    // axios.get("http://localhost:8080/api/get/productInfo?name=%22" + this.state.searchInputVal + "%22")
    axios.get("https://scraper-ceneo.herokuapp.com/api/get/productInfo?name=%22" + this.state.searchInputVal.toLowerCase() + "%22")
      .then((response) => {
        let propositionsLimited = response.data
        propositionsLimited = propositionsLimited.filter(el => el.id)
        propositionsLimited = propositionsLimited.filter(el => el.name !== "Polecany")
        propositionsLimited = propositionsLimited.filter(el => el.name !== "Nowość")
        propositionsLimited = propositionsLimited.slice(0, 5)
        this.setState(prevState => ({
          ...prevState,
          loading: false,
          propositions: propositionsLimited,
          zeroProductSearch: propositionsLimited.length === 0 ? true : false
        })) 
      })
  }

  handlePropositionClick(nameX, idX) {
    let wrongShops = false
    let dontAdd = false
    this.state.itemList.forEach(el => {
      if(el.id == idX) {
        dontAdd = true
      }
    })
    if (dontAdd) return
    let tooLessMuchProductsX = false
    if (this.state.itemList.length >= 4 || this.state.itemList.length === 0) {
      tooLessMuchProductsX = true
    }
    if (this.state.itemList.length !== 0) {
      wrongShops = true
    }
    this.setState(prevState => ({
    ...prevState,
    itemList: [...prevState.itemList, {name: nameX, id: idX}],
    propositions: [],
    searchInputVal: "",
    tooLessMuchProducts: tooLessMuchProductsX,
    wrongShops: wrongShops
    }))
    
  }

  handleDeleteItem(idX) {
    let tooLessMuchProducts = false
    this.setState(prevState => ({
      ...prevState,
      itemList: prevState.itemList.filter(el => el.id != idX),
      wrongShops: true
    }))
    // if(this.state.itemList.length >= 4 || this.state.itemList.length == 1) tooLessMuchProducts = true
    this.setState(prevState => ({
      ...prevState,
      tooLessMuchProducts: (prevState.itemList.length > 4 || prevState.itemList.length === 1) ? true : false
    }))
  }

  handleSearchShops() {

    let url = "https://scraper-ceneo.herokuapp.com/api/get/matchingStore?"
    let counter = 1
    this.state.itemList.forEach(el => {
      url = url + "id" + String(counter) + "=" + String(el.id) + "&"
      counter += 1
    })
    this.setState(prevState => ({
      ...prevState,
      loading: true
    }))
    axios.get(url)
      .then((response) => {
        response.data.sort((a, b) => (a.price - b.price))
        this.setState(prevState => ({
          ...prevState,
          loading: false,
          shopList: response.data,
          wrongShops: false,
          zeroShopSearch: response.data.length === 0 ? true : false,
        }))
      })
  }

  render() {
    return(
      <div className="App columns">
        <div className="column is-two-thirds-tablet is-half-desktop">
        <h1>MULTIZAMÓWIENIA Z CENEO</h1>
        <SearchBar  handleChange={this.handleChange}
                    handleSubmit={this.handleSubmit}
                    searchInputVal={this.state.searchInputVal}
                    loading={this.state.loading}/>
        
        <Propositions propositions={this.state.propositions}
                      handlePropositionClick={this.handlePropositionClick} 
                      zeroProductSearch={this.state.zeroProductSearch}/>
        
        <ItemsPicked  itemList={this.state.itemList}
                      handleDeleteItem={this.handleDeleteItem}
                      handleSearchShops={this.handleSearchShops}
                      tooLessMuchProducts={this.state.tooLessMuchProducts}/>
        
        <Shops  shopList={this.state.shopList}
                wrongShops={this.state.wrongShops}
                zeroShopSearch={this.state.zeroShopSearch}/>
        </div>
      </div>
    )
  }
}

export default App;