import React, { useState } from 'react';

// Thêm props onLessonSelect và activeLessonId để điều khiển video
const CurriculumAccordion = ({ curriculumData, onLessonSelect, activeLessonId }) => {
  const [openSectionId, setOpenSectionId] = useState(null);

  if (!curriculumData || curriculumData.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }}>
        🚀 Chương trình học đang được cập nhật, đợi xíu nha!
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '20px 0', 
      border: '1px solid #e2e8f0', 
      borderRadius: '12px', 
      overflow: 'hidden', 
      backgroundColor: 'white',
      textAlign: 'left' 
    }}>
      <h2 style={{ padding: '20px', fontSize: '18px', borderBottom: '2px solid #f1f5f9', margin: 0, color: '#0f172a' }}>
        📚 Nội dung khóa học
      </h2>
      
      {curriculumData.map((section) => (
        <div key={section.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
          <div 
            onClick={() => setOpenSectionId(openSectionId === section.id ? null : section.id)}
            style={{ 
              padding: '18px 20px', 
              backgroundColor: openSectionId === section.id ? '#f1f5f9' : '#f8fafc', 
              cursor: 'pointer', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              transition: '0.3s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{openSectionId === section.id ? '📂' : '📁'}</span>
              <strong style={{ color: '#1e293b' }}>{section.title}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>{section.lessons?.length || 0} bài học</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{openSectionId === section.id ? '▼' : '▶'}</span>
            </div>
          </div>

          {openSectionId === section.id && (
            <div style={{ backgroundColor: 'white' }}>
              {section.lessons && section.lessons.length > 0 ? (
                section.lessons.map((lesson) => (
                  <div 
                    key={lesson.id} 
                    // KHI BẤM VÀO BÀI THÌ GỌI HÀM CHỌN BÀI
                    onClick={() => onLessonSelect(lesson)}
                    style={{ 
                      padding: '14px 45px', 
                      borderTop: '1px solid #f1f5f9', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      cursor: 'pointer',
                      transition: '0.2s',
                      // HIGHLIGHT BÀI ĐANG CHỌN
                      backgroundColor: activeLessonId === lesson.id ? '#f0f9ff' : 'transparent'
                    }}
                    onMouseOver={(e) => { if(activeLessonId !== lesson.id) e.currentTarget.style.backgroundColor = '#f8fafc' }}
                    onMouseOut={(e) => { if(activeLessonId !== lesson.id) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <span style={{ color: activeLessonId === lesson.id ? '#3b82f6' : '#10b981' }}>▶️</span>
                    <span style={{ flex: 1, fontSize: '14px', color: activeLessonId === lesson.id ? '#3b82f6' : '#334155', fontWeight: activeLessonId === lesson.id ? 'bold' : 'normal' }}>{lesson.title}</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>{lesson.duration || 0}p</span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '15px 45px', fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                  Chương này chưa có bài học nào hết ní ơi!
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CurriculumAccordion;