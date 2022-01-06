in = beadando.md
out = Lukacs_Zsolt_HovaTovabb_HogyanKeszult.pdf

makepdf: $(in)
	pandoc -f gfm -s --toc --dpi=400 --columns=80 --pdf-engine=xelatex -V toc-title:"Tartalom" -V margin-top=1.3in -V margin-left=1.3in -V margin-right=1.3in -V margin-bottom=1.3in $(in) -o $(out)

clean: $(out)
	rm -i $(out)