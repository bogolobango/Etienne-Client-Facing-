import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#00d4aa',
    paddingBottom: 16,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#00d4aa',
  },
  subtitle: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
  meta: {
    fontSize: 9,
    color: '#666',
    marginTop: 8,
  },
  h1: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00d4aa',
    paddingBottom: 4,
  },
  h2: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    marginTop: 14,
    marginBottom: 6,
  },
  h3: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#333',
    marginBottom: 6,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  listItem: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#333',
    marginBottom: 3,
    paddingLeft: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingVertical: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#00d4aa',
    paddingVertical: 4,
    backgroundColor: '#f8f8f8',
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: '#333',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#999',
  },
  accentBar: {
    width: 3,
    backgroundColor: '#00d4aa',
    marginRight: 8,
  },
  accentBlock: {
    flexDirection: 'row',
    marginBottom: 8,
  },
})

interface ParsedSection {
  type: 'h1' | 'h2' | 'h3' | 'paragraph' | 'list-item' | 'table' | 'separator'
  content: string
  rows?: string[][]
}

function parseMarkdown(markdown: string): ParsedSection[] {
  const lines = markdown.split('\n')
  const sections: ParsedSection[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) {
      sections.push({ type: 'h1', content: line.slice(2).replace(/\*\*/g, '') })
    } else if (line.startsWith('## ')) {
      sections.push({ type: 'h2', content: line.slice(3).replace(/\*\*/g, '') })
    } else if (line.startsWith('### ')) {
      sections.push({ type: 'h3', content: line.slice(4).replace(/\*\*/g, '') })
    } else if (line.startsWith('---')) {
      sections.push({ type: 'separator', content: '' })
    } else if (line.startsWith('|') && lines[i + 1]?.match(/^\|[-|: ]+\|$/)) {
      // Parse markdown table
      const headerCells = line.split('|').filter(c => c.trim()).map(c => c.trim())
      const rows: string[][] = [headerCells]
      i += 2 // skip header and separator
      while (i < lines.length && lines[i].startsWith('|')) {
        const cells = lines[i].split('|').filter(c => c.trim()).map(c => c.trim().replace(/\*\*/g, ''))
        rows.push(cells)
        i++
      }
      sections.push({ type: 'table', content: '', rows })
      continue
    } else if (line.match(/^[0-9]+\.\s+/)) {
      sections.push({ type: 'list-item', content: line.replace(/\*\*/g, '') })
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      sections.push({ type: 'list-item', content: line.slice(2).replace(/\*\*/g, '') })
    } else if (line.trim()) {
      sections.push({ type: 'paragraph', content: line.replace(/\*\*/g, '') })
    }

    i++
  }

  return sections
}

function ReportDocument({ markdown, clientName }: { markdown: string; clientName: string }) {
  const sections = parseMarkdown(markdown)
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>Etienne Agency</Text>
          <Text style={styles.subtitle}>Cross-Location Intelligence Report</Text>
          <Text style={styles.meta}>
            Prepared for: {clientName}  |  Date: {dateStr}  |  Prepared by: Etienne Agency
          </Text>
        </View>

        {/* Content */}
        {sections.map((section, idx) => {
          switch (section.type) {
            case 'h1':
              return <Text key={idx} style={styles.h1}>{section.content}</Text>
            case 'h2':
              return <Text key={idx} style={styles.h2}>{section.content}</Text>
            case 'h3':
              return (
                <View key={idx} style={styles.accentBlock}>
                  <View style={styles.accentBar} />
                  <Text style={styles.h3}>{section.content}</Text>
                </View>
              )
            case 'separator':
              return <View key={idx} style={styles.separator} />
            case 'list-item':
              return <Text key={idx} style={styles.listItem}>{'•  '}{section.content}</Text>
            case 'table':
              if (!section.rows || section.rows.length === 0) return null
              return (
                <View key={idx} style={{ marginVertical: 8 }}>
                  {section.rows.map((row, ri) => (
                    <View key={ri} style={ri === 0 ? styles.tableHeaderRow : styles.tableRow}>
                      {row.map((cell, ci) => (
                        <Text key={ci} style={ri === 0 ? styles.tableHeaderCell : styles.tableCell}>
                          {cell}
                        </Text>
                      ))}
                    </View>
                  ))}
                </View>
              )
            case 'paragraph':
            default:
              return <Text key={idx} style={styles.paragraph}>{section.content}</Text>
          }
        })}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Prepared by Etienne Agency — etienneagency.com</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}

export async function generatePDF(markdown: string, clientName: string): Promise<Blob> {
  const blob = await pdf(<ReportDocument markdown={markdown} clientName={clientName} />).toBlob()
  return blob
}
