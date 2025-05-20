import React, { useState } from 'react';
import { predictStrategy } from '../api';

const MarketingStrategy = () => {
  const [formData, setFormData] = useState({
    industry: 'Food & Beverage',
    target_customer: 'Young Professionals',
    customer_age: '18-35 years',
    marketing_budget: 0
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const payload = {
        ...formData,
        customer_age: formData.customer_age.replace('years', 'ans').replace('-', '-'),
        target_customer: formData.target_customer.replace('Women', 'Femmes')
      };
      
      const response = await predictStrategy(payload);
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la génération de la stratégie');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="marketing" className="our-portfolio section">
      <div className="container">
        <div className="row">
          <div className="col-lg-6 offset-lg-3">
            <div className="section-heading wow bounceIn" data-wow-duration="1s" data-wow-delay="0.2s">
              <h2>Generate Your <em>Marketing Strategy</em></h2>
            </div>
          </div>
        </div>

        {/* Formulaire style contact */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit} id="contact" className="bg-white p-5 rounded shadow-sm">
              <div className="row">
                <div className="col-lg-6 mb-4">
                  <label className="form-label">Industry:</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                    className="form-select"
                  >
                    {['Food & Beverage', 'Fashion', 'Health', 'Tech', 'Education'].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-6 mb-4">
                  <label className="form-label">Target Customer:</label>
                  <select
                    name="target_customer"
                    value={formData.target_customer}
                    onChange={(e) => setFormData({...formData, target_customer: e.target.value})}
                    className="form-select"
                  >
                    {['Young Professionals', 'Startups & SMEs', 'Women 25-40 years'].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-6 mb-4">
                  <label className="form-label">Age Range:</label>
                  <select
                    name="customer_age"
                    value={formData.customer_age}
                    onChange={(e) => setFormData({...formData, customer_age: e.target.value})}
                    className="form-select"
                  >
                    {['18-35 years', '25-50 years', '25-40 years', '50+ years'].map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="col-lg-6 mb-4">
                  <label className="form-label">Marketing Budget ($):</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control"
                    value={formData.marketing_budget}
                    onChange={(e) => setFormData({...formData, marketing_budget: e.target.value})}
                    required 
                  />
                </div>

                <div className="col-lg-12 text-center">
                  <button 
                    type="submit" 
                    className="main-blue-button"
                    disabled={loading}
                  >
                    {loading ? 'Generating...' : 'Generate Strategy'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Résultats style portfolio */}
        {results && (
          <div className="row mt-5">
            <div className="col-lg-12">
              <div className="section-heading text-center mb-5">
                <h3>Marketing Plan: <em className="text-primary">{results.prediction}</em></h3>
                <p className="text-muted"><strong>Current Trend:</strong> {results.trend_used}</p>
              </div>
              
              <div className="row g-4">
                {Object.entries(results.llm_strategy).map(([section, items], index) => {
                  // Détermine la couleur selon la section
                  const isBlueSection = ['BUDGET', 'KPIS', 'TIMELINE'].includes(section);
                  const colorClass = isBlueSection ? 'section-blue' : 'section-red';
                  const sectionNumber = (index + 1).toString().padStart(2, '0');

                  return (
                    <div key={section} className="col-lg-4 col-md-6">
                      <div 
                        className={`strategy-card bg-white p-4 rounded-3 h-100 wow bounceInUp ${colorClass}`}
                        data-wow-duration="1s" 
                        data-wow-delay={`${0.3 + index * 0.1}s`}
                      >
                        <div className="section-number">{sectionNumber}</div>
                        <div className="section-content">
                          <h4 className="section-title">
                            {section.replace(/_/g, ' ')}
                          </h4>
                          <ul className="list-unstyled mb-0">
                            {items.map((item, idx) => (
                              <li key={idx} className="d-flex align-items-start mb-2">
                                <i className="fa fa-diamond me-2"></i>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Gestion des erreurs et loading */}
        {error && (
          <div className="row mt-4">
            <div className="col-lg-12">
              <div className="alert alert-danger text-center">{error}</div>
            </div>
          </div>
        )}

        {loading && !results && (
          <div className="row mt-4">
            <div className="col-lg-12 text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingStrategy;