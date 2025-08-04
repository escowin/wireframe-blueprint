import React, { useState } from 'react'
import { Template, TemplateCategory } from '../types'
import { templateCategories } from '../utils/templates'
import './Templates.scss'

interface TemplatesProps {
  onApplyTemplate: (templateId: string) => void
}

const Templates: React.FC<TemplatesProps> = ({ onApplyTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('layout')
  const [isOpen, setIsOpen] = useState(false)

  const handleTemplateClick = (template: Template) => {
    onApplyTemplate(template.id)
    setIsOpen(false)
  }

  const selectedCategoryData = templateCategories.find(cat => cat.id === selectedCategory)

  return (
    <div className="templates-container">
      <button
        className="btn btn--primary templates-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Open Templates"
      >
        📋 Templates
      </button>

      {isOpen && (
        <div className="templates-modal">
          <div className="templates-header">
            <h3>Templates</h3>
            <button
              className="templates-close"
              onClick={() => setIsOpen(false)}
              title="Close Templates"
            >
              ✕
            </button>
          </div>

          <div className="templates-categories">
            {templateCategories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          <div className="templates-grid">
            {selectedCategoryData?.templates.map(template => (
              <div
                key={template.id}
                className="template-card"
                onClick={() => handleTemplateClick(template)}
              >
                <div className="template-preview">
                  <div className="template-shapes">
                    {template.shapes.slice(0, 6).map((shape, index) => (
                      <div
                        key={index}
                        className="template-shape-preview"
                        style={{
                          left: `${(shape.position.x / 800) * 100}%`,
                          top: `${(shape.position.y / 600) * 100}%`,
                          width: `${(shape.size.width / 800) * 100}%`,
                          height: `${(shape.size.height / 600) * 100}%`,
                          backgroundColor: shape.fillColor,
                          border: `${shape.borderWidth}px ${shape.borderStyle} ${shape.borderColor}`,
                          borderRadius: `${shape.borderRadius}px`,
                          opacity: shape.opacity,
                          zIndex: shape.zIndex
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="template-info">
                  <h4 className="template-name">{template.name}</h4>
                  <p className="template-description">{template.description}</p>
                  <div className="template-meta">
                    <span className="template-shape-count">
                      {template.shapes.length} shapes
                    </span>
                    {template.groups.length > 0 && (
                      <span className="template-group-count">
                        {template.groups.length} groups
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="templates-footer">
            <p className="templates-help">
              Click on a template to add it to your canvas. Templates will be added to your existing design.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Templates 