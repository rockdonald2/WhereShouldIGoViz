in = beadando.md
out = Lukacs_Zsolt_HovaTovabb_HogyanKeszult.pdf

makepdf: $(in)
	pandoc -f gfm -s --toc --dpi=400 --columns=80 $(in) -o $(out)

clean: $(out)
	rm -i $(out)