/**
 * Returns the appropriate CSS classes for grade color styling
 * @param grade - The grade string (e.g., 'A+', 'B', 'C-', etc.)
 * @returns CSS class string for background and text color
 */
export function getGradeColor(grade: string | null): string {
  if (!grade) return 'bg-gray-100 text-gray-600'
  
  switch (grade.toUpperCase()) {
    case 'A':
    case 'A+':
    case 'A-':
      return 'bg-green-100 text-green-800'
    case 'B':
    case 'B+':
    case 'B-':
      return 'bg-blue-100 text-blue-800'
    case 'C':
    case 'C+':
    case 'C-':
      return 'bg-yellow-100 text-yellow-800'
    case 'D':
    case 'D+':
    case 'D-':
      return 'bg-orange-100 text-orange-800'
    case 'F':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}