"use client"

import { useState, useEffect } from "react"
import api from "../services/api"
import ProductForm from "../components/products/ProductForm"
import ProductList from "../components/products/ProductList"
import Alert from "../components/common/Alert"
import Loader from "../components/common/Loader"

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: "", type: "" })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await api.getProducts()
      setProducts(data)
    } catch (error) {
      showAlert(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (formData) => {
    setLoading(true)
    try {
      await api.addProduct(formData)
      showAlert("Produit ajouté avec succès", "success")
      loadProducts()
    } catch (error) {
      showAlert(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type })
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" })
    }, 3000)
  }

  return (
    <section className="section">
      <div className="container">
        <h2>Gestion des Produits</h2>

        {alert.show && <Alert message={alert.message} type={alert.type} />}

        <div className="card">
          <h3>Ajouter un nouveau produit</h3>
          <ProductForm onSubmit={addProduct} />
        </div>

        <h3>Liste des produits</h3>
        {loading ? <Loader /> : <ProductList products={products} />}
      </div>
    </section>
  )
}

export default ProductsPage
