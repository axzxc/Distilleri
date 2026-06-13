# Graph Report - /mnt/s/Claude/Distilleri  (2026-06-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 60 nodes · 65 edges · 11 communities (6 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Manifest and Service Worker|Manifest and Service Worker]]
- [[_COMMUNITY_Opinion Analysis|Opinion Analysis]]
- [[_COMMUNITY_Text Analysis|Text Analysis]]
- [[_COMMUNITY_Extension Icons|Extension Icons]]
- [[_COMMUNITY_Icon Sizes|Icon Sizes]]
- [[_COMMUNITY_Popup Logic|Popup Logic]]
- [[_COMMUNITY_Options Page|Options Page]]
- [[_COMMUNITY_Base64 Encoding|Base64 Encoding]]
- [[_COMMUNITY_16x16 Icon|16x16 Icon]]
- [[_COMMUNITY_48x48 Icon|48x48 Icon]]

## God Nodes (most connected - your core abstractions)
1. `processPage()` - 5 edges
2. `analyzeText()` - 4 edges
3. `highlightOpinion()` - 4 edges
4. `init()` - 4 edges
5. `default_icon` - 4 edges
6. `icons` - 4 edges
7. `intensityToDarkColor()` - 3 edges
8. `background` - 3 edges
9. `action` - 3 edges
10. `analyzeWithAPI()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (11 total, 5 thin omitted)

### Community 0 - "Manifest and Service Worker"
Cohesion: 0.13
Nodes (14): background, service_worker, type, content_scripts, content_security_policy, extension_pages, description, host_permissions (+6 more)

### Community 1 - "Opinion Analysis"
Cohesion: 0.24
Nodes (10): analyzeTextForOpinion(), detectFallacies(), extractArticleContent(), highlightOpinion(), init(), intensityToDarkColor(), intensityToHue(), loadFallacies() (+2 more)

### Community 2 - "Text Analysis"
Cohesion: 0.36
Nodes (5): analyzeText(), analyzeWithAPI(), analyzeWithLocalModel(), cache, isLicenseValid()

### Community 3 - "Extension Icons"
Cohesion: 0.33
Nodes (6): action, default_icon, default_popup, 128, 16, 48

### Community 4 - "Icon Sizes"
Cohesion: 0.50
Nodes (4): icons, 128, 16, 48

## Knowledge Gaps
- **24 isolated node(s):** `cache`, `b64Icons`, `manifest_version`, `name`, `version` (+19 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `action` connect `Extension Icons` to `Manifest and Service Worker`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `icons` connect `Icon Sizes` to `Manifest and Service Worker`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `cache`, `b64Icons`, `manifest_version` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Manifest and Service Worker` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._